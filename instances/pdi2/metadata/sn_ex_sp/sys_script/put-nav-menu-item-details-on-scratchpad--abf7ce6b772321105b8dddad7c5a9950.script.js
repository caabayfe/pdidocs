(function executeRule(current, previous /*null when async*/ ) {

    var portalExtNavUtil = new sn_ex_sp.PortalExtensibleNavigationUtil();
    g_scratchpad.nav_item_depth = portalExtNavUtil.getDepthOfPortalNavMenuItem(current);
    g_scratchpad.top_nav_item_display_type = portalExtNavUtil.getTopPortalNavMenuItemDisplayType(current);
    if (current.menu)
        g_scratchpad.menu_type = current.menu.type;
})(current, previous);
