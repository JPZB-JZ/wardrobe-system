package com.aurastyle.wardrobe.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
import com.aurastyle.wardrobe.ui.theme.*
import kotlinx.coroutines.launch
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddItemScreen(navController: NavController) {
    val context = LocalContext.current
    val dataStore = remember { WardrobeDataStore(context) }
    val scope = rememberCoroutineScope()
    
    var name by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(Category.TOP) }
    var selectedColor by remember { mutableStateOf("#c46d9c") }
    var colorName by remember { mutableStateOf("粉色") }
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    
    // 图片选择器
    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { imageUri = it }
    }
    
    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success ->
        // 处理相机返回
    }
    
    val scrollState = rememberScrollState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("添加衣物") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // 图片选择区域
            ImageSelector(
                imageUri = imageUri,
                onGalleryClick = { galleryLauncher.launch("image/*") },
                onCameraClick = { /* TODO: 相机 */ }
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // 名称输入
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("衣物名称") },
                placeholder = { Text("例如：白色T恤") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 分类选择
            Text(
                text = "分类",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            CategorySelector(
                selected = selectedCategory,
                onSelect = { selectedCategory = it }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 颜色选择
            Text(
                text = "颜色",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            ColorSelector(
                selected = selectedColor,
                onSelect = { color, name ->
                    selectedColor = color
                    colorName = name
                }
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // 保存按钮
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        scope.launch {
                            val item = ClothingItem(
                                id = UUID.randomUUID().toString(),
                                name = name,
                                category = selectedCategory,
                                color = selectedColor,
                                colorName = colorName,
                                imageUri = imageUri
                            )
                            dataStore.addClothingItem(item)
                            navController.popBackStack()
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary
                )
            ) {
                Text(
                    text = "保存",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun ImageSelector(
    imageUri: Uri?,
    onGalleryClick: () -> Unit,
    onCameraClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(20.dp))
            .background(SurfaceHigh),
        contentAlignment = Alignment.Center
    ) {
        if (imageUri != null) {
            AsyncImage(
                model = imageUri,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        } else {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("👗", fontSize = 64.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "添加照片",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextSecondary
                )
            }
        }
        
        // 操作按钮
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            FilledTonalButton(
                onClick = onGalleryClick,
                modifier = Modifier.weight(1f)
            ) {
                Text("📷", fontSize = 20.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text("相册")
            }
            
            Button(
                onClick = onCameraClick,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary
                )
            ) {
                Text("📸", fontSize = 20.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text("拍照")
            }
        }
    }
}

@Composable
private fun CategorySelector(
    selected: Category,
    onSelect: (Category) -> Unit
) {
    val categories = Category.values()
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        categories.forEach { category ->
            val isSelected = selected == category
            FilterChip(
                selected = isSelected,
                onClick = { onSelect(category) },
                label = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(category.icon())
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(category.displayName())
                    }
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Primary,
                    selectedLabelColor = Color.White
                )
            )
        }
    }
}

@Composable
private fun ColorSelector(
    selected: String,
    onSelect: (String, String) -> Unit
) {
    val colors = listOf(
        "#c46d9c" to "粉色",
        "#92400e" to "棕色",
        "#d4a574" to "米色",
        "#1a1c1d" to "黑色",
        "#ffffff" to "白色",
        "#3b82f6" to "蓝色",
        "#10b981" to "绿色",
        "#f59e0b" to "黄色",
        "#ef4444" to "红色",
        "#8b5cf6" to "紫色",
        "#6b7280" to "灰色",
        "#f97316" to "橙色"
    )
    
    // 颜色网格 - 使用 FlowRow 简化实现
    val rows = colors.chunked(6)
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        rows.forEach { rowColors ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                rowColors.forEach { (color, name) ->
                    val isSelected = selected == color
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(
                                try {
                                    Color(android.graphics.Color.parseColor(color))
                                } catch (e: Exception) {
                                    SurfaceHigh
                                }
                            )
                            .clickable { onSelect(color, name) },
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSelected) {
                            Text("✓", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}