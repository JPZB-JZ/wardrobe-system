package com.aurastyle.wardrobe.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aurastyle.wardrobe.data.local.WardrobeDataStore
import com.aurastyle.wardrobe.data.model.Category
import com.aurastyle.wardrobe.data.model.ClothingItem
import com.aurastyle.wardrobe.data.model.displayName
import com.aurastyle.wardrobe.data.model.icon
import com.aurastyle.wardrobe.ui.navigation.Screen
import com.aurastyle.wardrobe.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WardrobeScreen(navController: NavController) {
    val context = LocalContext.current
    val dataStore = remember { WardrobeDataStore(context) }
    val scope = rememberCoroutineScope()
    
    var clothingItems by remember { mutableStateOf<List<ClothingItem>>(emptyList()) }
    var selectedCategory by remember { mutableStateOf<Category?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    
    LaunchedEffect(Unit) {
        dataStore.clothingItems.collect { items ->
            clothingItems = items
        }
    }
    
    val filteredItems = clothingItems.filter { item ->
        val matchesCategory = selectedCategory == null || item.category == selectedCategory
        val matchesSearch = searchQuery.isEmpty() || 
            item.name.contains(searchQuery, ignoreCase = true) ||
            item.aiTags.any { it.contains(searchQuery, ignoreCase = true) }
        matchesCategory && matchesSearch
    }
    
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate(Screen.AddItem.route) },
                containerColor = Primary
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "添加",
                    tint = Color.White
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // 标题
            Text(
                text = "我的衣橱",
                style = MaterialTheme.typography.headlineLarge,
                color = Primary,
                fontWeight = FontWeight.ExtraBold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 搜索栏
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("搜索衣物...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = SurfaceHigh,
                    unfocusedContainerColor = SurfaceHigh
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 分类筛选
            CategoryFilter(
                selected = selectedCategory,
                onSelect = { selectedCategory = it }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 衣物网格
            if (filteredItems.isEmpty()) {
                EmptyWardrobeState()
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredItems) { item ->
                        ClothingItemCard(
                            item = item,
                            onClick = {
                                navController.navigate(Screen.ItemDetail.createRoute(item.id))
                            },
                            onFavoriteClick = {
                                scope.launch {
                                    val updated = item.copy(isFavorite = !item.isFavorite)
                                    val newList = clothingItems.map { 
                                        if (it.id == item.id) updated else it 
                                    }
                                    dataStore.saveClothingItems(newList)
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryFilter(
    selected: Category?,
    onSelect: (Category?) -> Unit
) {
    val categories = Category.values().toList()
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // "全部" 按钮
        FilterChip(
            selected = selected == null,
            onClick = { onSelect(null) },
            label = { Text("全部") }
        )
        
        // 分类按钮
        categories.forEach { category ->
            FilterChip(
                selected = selected == category,
                onClick = { onSelect(category) },
                label = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(category.icon())
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(category.displayName())
                    }
                }
            )
        }
    }
}

@Composable
private fun ClothingItemCard(
    item: ClothingItem,
    onClick: () -> Unit,
    onFavoriteClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Surface
        )
    ) {
        Column {
            // 图片区域
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .background(
                        try {
                            androidx.compose.ui.graphics.Color(
                                android.graphics.Color.parseColor(item.color)
                            )
                        } catch (e: Exception) {
                            SurfaceHigh
                        }
                    )
            ) {
                if (item.imageUri != null) {
                    AsyncImage(
                        model = item.imageUri,
                        contentDescription = item.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(item.category.icon(), fontSize = 48.sp)
                    }
                }
                
                // 收藏按钮
                IconButton(
                    onClick = onFavoriteClick,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(32.dp)
                        .background(
                            color = Color.White.copy(alpha = 0.8f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (item.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = "收藏",
                        tint = if (item.isFavorite) Primary else TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
            
            // 信息区域
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.category.displayName(),
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Text(
                        text = "${item.wearCount}次穿搭",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyWardrobeState() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("👔", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "衣橱空空如也",
            style = MaterialTheme.typography.headlineSmall
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "点击右下角 + 添加衣物",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )
    }
}