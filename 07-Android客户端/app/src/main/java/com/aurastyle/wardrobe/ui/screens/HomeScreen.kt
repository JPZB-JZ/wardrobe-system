package com.aurastyle.wardrobe.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aurastyle.wardrobe.data.local.WardrobeDataStore
import com.aurastyle.wardrobe.data.model.*
import com.aurastyle.wardrobe.ui.navigation.Screen
import com.aurastyle.wardrobe.ui.theme.*
import kotlinx.coroutines.launch
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val context = LocalContext.current
    val dataStore = remember { WardrobeDataStore(context) }
    val scope = rememberCoroutineScope()
    
    var clothingItems by remember { mutableStateOf<List<ClothingItem>>(emptyList()) }
    var currentOutfit by remember { mutableStateOf<Outfit?>(null) }
    var occasion by remember { mutableStateOf("") }
    var isAiLoading by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        dataStore.clothingItems.collect { items ->
            clothingItems = items
            if (currentOutfit == null && items.isNotEmpty()) {
                currentOutfit = generateOutfit(items, occasion)
            }
        }
    }
    
    val scrollState = rememberScrollState()
    
    Box(modifier = Modifier.fillMaxSize()) {
        // 背景渐变
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Background,
                            PrimaryLight.copy(alpha = 0.3f),
                            Background
                        )
                    )
                )
        )
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(72.dp)) // 为顶部栏留空间
            
            // 天气卡片 - 玻璃效果
            WeatherCard()
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 语音推荐按钮 - 渐变背景
            VoiceButton()
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 场合选择
            OccasionChips(
                selected = occasion,
                onSelect = { occasion = it }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 今日精选标题栏
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "今日精选",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Primary
                    )
                    Text(
                        text = "本地规则搭配",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
                
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // 刷新按钮
                    GlassButton(
                        onClick = {
                            currentOutfit = generateOutfit(clothingItems, occasion)
                        },
                        enabled = clothingItems.isNotEmpty()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "刷新",
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("刷新", fontSize = 12.sp)
                    }
                    
                    // AI 生成按钮
                    GradientButton(
                        onClick = { /* TODO: AI */ },
                        enabled = false
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "AI",
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("AI 生成", fontSize = 12.sp)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 搭配展示
            if (currentOutfit != null) {
                OutfitCard(
                    outfit = currentOutfit!!,
                    onItemClick = { item ->
                        navController.navigate(Screen.ItemDetail.createRoute(item.id))
                    }
                )
            } else if (clothingItems.isEmpty()) {
                EmptyState(
                    onAddClick = {
                        navController.navigate(Screen.AddItem.route)
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(100.dp)) // 底部导航栏空间
        }
        
        // 顶部栏 - 固定在顶部
        TopBar()
    }
}

@Composable
private fun TopBar() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(GlassBackground)
            .border(1.dp, GlassBorder)
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { }) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "搜索",
                    tint = TextSecondary,
                    modifier = Modifier.size(20.dp)
                )
            }
            
            Text(
                text = "Aura Style",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Primary
            )
            
            Box(modifier = Modifier.size(40.dp))
        }
    }
}

@Composable
private fun WeatherCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(GlassBackground)
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
            .clickable { }
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "26°",
                fontSize = 32.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Primary
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "西安 · 多云",
                    fontSize = 14.sp,
                    color = TextSecondary
                )
            }
            
            Text("📍", fontSize = 20.sp)
        }
    }
}

@Composable
private fun VoiceButton() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
                brush = Brush.horizontalGradient(
                    colors = listOf(GradientStart, GradientMid, GradientEnd)
                )
            )
            .clickable { }
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("🎙️", fontSize = 20.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "今日智能穿搭语音推荐",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}

@Composable
private fun OccasionChips(
    selected: String,
    onSelect: (String) -> Unit
) {
    val occasions = listOf("全部", "日常", "上班", "约会", "聚会", "运动")
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        occasions.forEach { occasion ->
            val isSelected = selected == occasion || (selected.isEmpty() && occasion == "全部")
            val bgColor = if (isSelected) Primary else Surface
            val textColor = if (isSelected) Color.White else TextSecondary
            val borderColor = if (isSelected) Primary else GlassBorder
            
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(bgColor)
                    .border(1.dp, borderColor, RoundedCornerShape(20.dp))
                    .clickable { onSelect(if (occasion == "全部") "" else occasion) }
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = occasion,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor
                )
            }
        }
    }
}

@Composable
private fun GlassButton(
    onClick: () -> Unit,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(if (enabled) GlassBackground else Surface.copy(alpha = 0.5f))
            .border(1.dp, if (enabled) GlassBorder else SurfaceHigh, RoundedCornerShape(20.dp))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            content()
        }
    }
}

@Composable
private fun GradientButton(
    onClick: () -> Unit,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(
                if (enabled) {
                    Brush.horizontalGradient(
                        colors = listOf(GradientStart.copy(alpha = 0.2f), GradientEnd.copy(alpha = 0.2f))
                    )
                } else {
                    Brush.horizontalGradient(colors = listOf(SurfaceHigh, SurfaceHigh))
                }
            )
            .border(
                1.dp,
                if (enabled) GradientStart.copy(alpha = 0.3f) else SurfaceHigh,
                RoundedCornerShape(20.dp)
            )
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            content()
        }
    }
}

@Composable
private fun OutfitCard(
    outfit: Outfit,
    onItemClick: (ClothingItem) -> Unit
) {
    // 玻璃效果卡片
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(GlassBackground)
            .border(1.dp, GlassBorder, RoundedCornerShape(20.dp))
            .padding(12.dp)
    ) {
        Column {
            // 搭配网格 - 左二右一布局
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 左列：上衣 + 下装
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    outfit.items.find { it.category == Category.TOP || it.category == Category.DRESS }?.let { item ->
                        OutfitItemBox(item = item, onClick = { onItemClick(item) })
                    }
                    
                    outfit.items.find { it.category == Category.BOTTOM }?.let { item ->
                        OutfitItemBox(item = item, onClick = { onItemClick(item) })
                    }
                }
                
                // 右列：鞋子（垂直居中）
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.Center
                ) {
                    outfit.items.find { it.category == Category.SHOES }?.let { item ->
                        OutfitItemBox(
                            item = item,
                            onClick = { onItemClick(item) },
                            modifier = Modifier.aspectRatio(1f)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // 底部：评分圆环 + AI试穿
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 渐变圆环评分
                ScoreRing(score = outfit.score)
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Text(
                    text = "搭配分",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                
                Spacer(modifier = Modifier.weight(1f))
                
                // AI 虚拟试穿按钮
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Primary.copy(alpha = 0.1f))
                        .clickable { }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "👗 AI虚拟试穿",
                        fontSize = 12.sp,
                        color = Primary
                    )
                }
            }
        }
    }
}

@Composable
private fun OutfitItemBox(
    item: ClothingItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .background(
                try {
                    Color(android.graphics.Color.parseColor(item.color))
                } catch (e: Exception) {
                    SurfaceHigh
                }
            )
            .clickable(onClick = onClick)
    ) {
        if (item.imageUri != null) {
            AsyncImage(
                model = item.imageUri,
                contentDescription = item.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
        
        // 名称标签
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(4.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color.Black.copy(alpha = 0.4f))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(
                text = item.name,
                fontSize = 10.sp,
                color = Color.White
            )
        }
    }
}

@Composable
private fun ScoreRing(score: Int) {
    // 渐变圆环
    Box(
        modifier = Modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(
                brush = Brush.sweepGradient(
                    colors = listOf(GradientStart, GradientMid, GradientEnd, GradientStart)
                )
            )
            .padding(3.dp)
            .clip(CircleShape)
            .background(Background),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "$score",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Primary
        )
    }
}

@Composable
private fun EmptyState(onAddClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("👗", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "衣橱还是空的",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "添加衣物，获取智能搭配推荐",
            fontSize = 14.sp,
            color = TextSecondary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = onAddClick,
            colors = ButtonDefaults.buttonColors(containerColor = Primary)
        ) {
            Text("添加第一件衣物")
        }
    }
}

// 搭配生成算法
private fun generateOutfit(items: List<ClothingItem>, occasion: String): Outfit? {
    if (items.isEmpty()) return null
    
    val tops = items.filter { it.category == Category.TOP || it.category == Category.DRESS }
    val bottoms = items.filter { it.category == Category.BOTTOM }
    val shoes = items.filter { it.category == Category.SHOES }
    val outers = items.filter { it.category == Category.OUTER }
    
    val selectedItems = mutableListOf<ClothingItem>()
    
    tops.randomOrNull()?.let { selectedItems.add(it) }
    
    if (selectedItems.none { it.category == Category.DRESS }) {
        bottoms.randomOrNull()?.let { selectedItems.add(it) }
    }
    
    shoes.randomOrNull()?.let { selectedItems.add(it) }
    
    if (outers.isNotEmpty() && kotlin.random.Random.nextBoolean()) {
        outers.randomOrNull()?.let { selectedItems.add(it) }
    }
    
    if (selectedItems.size < 2) return null
    
    return Outfit(
        id = UUID.randomUUID().toString(),
        name = "智能搭配 #${kotlin.random.Random.nextInt(1000)}",
        items = selectedItems,
        score = kotlin.random.Random.nextInt(75, 98),
        description = "根据${if (occasion.isEmpty()) "日常" else occasion}场合推荐"
    )
}