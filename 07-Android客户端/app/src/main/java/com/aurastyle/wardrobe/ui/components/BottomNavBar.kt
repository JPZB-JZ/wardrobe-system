package com.aurastyle.wardrobe.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.aurastyle.wardrobe.ui.navigation.Screen
import com.aurastyle.wardrobe.ui.theme.Primary
import com.aurastyle.wardrobe.ui.theme.TextMuted
import com.aurastyle.wardrobe.ui.theme.TextSecondary

@Composable
fun BottomNavBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    val items = listOf(
        NavItem("首页", "👗", Screen.Home.route),
        NavItem("衣橱", "👔", Screen.Wardrobe.route),
        NavItem("添加", "➕", Screen.AddItem.route),
        NavItem("分析", "📊", Screen.Analysis.route),
        NavItem("设置", "⚙️", Screen.Settings.route)
    )
    
    Box {
        // 背景模糊层
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp),
            color = Color.White.copy(alpha = 0.75f),
            tonalElevation = 0.dp
        ) {}
        
        NavigationBar(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp),
            containerColor = Color.Transparent,
            tonalElevation = 0.dp
        ) {
            items.forEach { item ->
                val selected = currentRoute == item.route
                val color by animateColorAsState(
                    targetValue = if (selected) Primary else TextSecondary,
                    label = "nav_color"
                )
                
                NavigationBarItem(
                    icon = {
                        Text(
                            text = item.icon,
                            fontSize = if (selected) 28.sp else 24.sp
                        )
                    },
                    label = {
                        Text(
                            text = item.label,
                            style = MaterialTheme.typography.labelMedium,
                            color = color
                        )
                    },
                    selected = selected,
                    onClick = {
                        if (currentRoute != item.route) {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Primary,
                        selectedTextColor = Primary,
                        unselectedIconColor = TextSecondary,
                        unselectedTextColor = TextSecondary,
                        indicatorColor = Primary.copy(alpha = 0.1f)
                    )
                )
            }
        }
    }
}

data class NavItem(val label: String, val icon: String, val route: String)