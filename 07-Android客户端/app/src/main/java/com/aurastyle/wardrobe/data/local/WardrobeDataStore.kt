package com.aurastyle.wardrobe.data.local

import android.content.Context
import android.net.Uri
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.aurastyle.wardrobe.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import org.json.JSONArray
import org.json.JSONObject

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "wardrobe")

class WardrobeDataStore(private val context: Context) {
    
    private val itemsKey = stringPreferencesKey("clothing_items")
    private val outfitsKey = stringPreferencesKey("outfits")
    private val aiConfigKey = stringPreferencesKey("ai_config")
    
    // 衣物列表
    val clothingItems: Flow<List<ClothingItem>> = context.dataStore.data
        .map { preferences ->
            val jsonStr = preferences[itemsKey] ?: "[]"
            parseClothingItems(jsonStr)
        }
    
    // 保存衣物
    suspend fun saveClothingItems(items: List<ClothingItem>) {
        val jsonStr = clothingItemsToJson(items)
        context.dataStore.edit { preferences ->
            preferences[itemsKey] = jsonStr
        }
    }
    
    // 添加单个衣物
    suspend fun addClothingItem(item: ClothingItem) {
        val currentItems = clothingItems.first()
        saveClothingItems(currentItems + item)
    }
    
    // 删除衣物
    suspend fun deleteClothingItem(id: String) {
        val currentItems = clothingItems.first()
        saveClothingItems(currentItems.filter { it.id != id })
    }
    
    // 保存搭配
    suspend fun saveOutfits(outfits: List<Outfit>) {
        val jsonArray = JSONArray()
        outfits.forEach { outfit ->
            val obj = JSONObject().apply {
                put("id", outfit.id)
                put("name", outfit.name)
                put("score", outfit.score)
            }
            jsonArray.put(obj)
        }
        context.dataStore.edit { preferences ->
            preferences[outfitsKey] = jsonArray.toString()
        }
    }
    
    // 解析 JSON
    private fun parseClothingItems(jsonStr: String): List<ClothingItem> {
        return try {
            val jsonArray = JSONArray(jsonStr)
            val items = mutableListOf<ClothingItem>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                items.add(parseClothingItem(obj))
            }
            items
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private fun parseClothingItem(obj: JSONObject): ClothingItem {
        return ClothingItem(
            id = obj.optString("id", ""),
            name = obj.optString("name", ""),
            category = try {
                Category.valueOf(obj.optString("category", "TOP"))
            } catch (e: Exception) {
                Category.TOP
            },
            color = obj.optString("color", "#c46d9c"),
            colorName = obj.optString("colorName", ""),
            imageUri = obj.optString("imageUri").takeIf { it.isNotEmpty() }?.let { Uri.parse(it) },
            isFavorite = obj.optBoolean("isFavorite", false),
            wearCount = obj.optInt("wearCount", 0),
            lastWorn = obj.optLong("lastWorn", 0).takeIf { it > 0 },
            aiDescription = obj.optString("aiDescription").takeIf { it.isNotEmpty() },
            aiTags = parseStringList(obj.optJSONArray("aiTags"))
        )
    }
    
    private fun parseStringList(array: JSONArray?): List<String> {
        if (array == null) return emptyList()
        return (0 until array.length()).map { array.getString(it) }
    }
    
    // 转换为 JSON
    private fun clothingItemsToJson(items: List<ClothingItem>): String {
        val jsonArray = JSONArray()
        items.forEach { item ->
            jsonArray.put(clothingItemToJson(item))
        }
        return jsonArray.toString()
    }
    
    private fun clothingItemToJson(item: ClothingItem): JSONObject {
        return JSONObject().apply {
            put("id", item.id)
            put("name", item.name)
            put("category", item.category.name)
            put("color", item.color)
            put("colorName", item.colorName)
            put("imageUri", item.imageUri?.toString() ?: "")
            put("isFavorite", item.isFavorite)
            put("wearCount", item.wearCount)
            put("lastWorn", item.lastWorn ?: 0)
            put("aiDescription", item.aiDescription ?: "")
            put("aiTags", JSONArray(item.aiTags))
        }
    }
}