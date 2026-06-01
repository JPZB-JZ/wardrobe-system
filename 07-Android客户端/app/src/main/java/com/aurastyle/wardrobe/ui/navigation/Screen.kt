package com.aurastyle.wardrobe.ui.navigation

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Wardrobe : Screen("wardrobe")
    data object AddItem : Screen("add_item")
    data object ItemDetail : Screen("item_detail/{itemId}") {
        fun createRoute(itemId: String) = "item_detail/$itemId"
    }
    data object Settings : Screen("settings")
    data object Analysis : Screen("analysis")
    data object Calendar : Screen("calendar")
}