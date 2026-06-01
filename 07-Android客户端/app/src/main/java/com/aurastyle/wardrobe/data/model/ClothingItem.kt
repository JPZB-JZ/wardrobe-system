package com.aurastyle.wardrobe.data.model

import android.net.Uri

data class ClothingItem(
    val id: String,
    val name: String,
    val category: Category,
    val color: String,
    val colorName: String,
    val imageUri: Uri? = null,
    val isFavorite: Boolean = false,
    val wearCount: Int = 0,
    val lastWorn: Long? = null,
    val aiDescription: String? = null,
    val aiTags: List<String> = emptyList()
)

enum class Category {
    TOP,      // 上衣
    BOTTOM,   // 下装
    DRESS,    // 连衣裙
    OUTER,    // 外套
    SHOES,    // 鞋子
    ACCESSORY // 配饰
}

fun Category.displayName(): String = when (this) {
    Category.TOP -> "上衣"
    Category.BOTTOM -> "下装"
    Category.DRESS -> "连衣裙"
    Category.OUTER -> "外套"
    Category.SHOES -> "鞋子"
    Category.ACCESSORY -> "配饰"
}

fun Category.icon(): String = when (this) {
    Category.TOP -> "👕"
    Category.BOTTOM -> "👖"
    Category.DRESS -> "👗"
    Category.OUTER -> "🧥"
    Category.SHOES -> "👟"
    Category.ACCESSORY -> "💍"
}

data class Outfit(
    val id: String,
    val name: String,
    val items: List<ClothingItem>,
    val score: Int,
    val description: String? = null
)

data class WeatherInfo(
    val temp: Int,
    val description: String,
    val city: String
)