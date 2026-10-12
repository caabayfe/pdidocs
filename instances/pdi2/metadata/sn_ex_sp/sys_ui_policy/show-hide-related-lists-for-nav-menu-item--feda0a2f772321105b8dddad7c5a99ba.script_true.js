function onCondition() {
    var depth = Number(g_scratchpad.nav_item_depth);
    var navItemDisplayType = g_scratchpad.top_nav_item_display_type;
    var hideRelatedLists = ((g_scratchpad.menu_type == 'scripted') || (g_scratchpad.menu_type == 'filtered')) ? true : false;

    if (hideRelatedLists) {
        g_form.hideRelatedList('sn_ex_sp_portal_extensible_navigation_item.parent_item');
        g_form.hideRelatedList('sn_ex_sp_m2m_portal_navigation_item_quicklink.navigation_menu_item');
        return;
    }
    if (navItemDisplayType) {
        if ((navItemDisplayType == 'standard' && depth > 1 || navItemDisplayType == 'expanded' && depth > 2)) {
            g_form.hideRelatedList('sn_ex_sp_portal_extensible_navigation_item.parent_item');
        }
        if (navItemDisplayType == 'standard' && depth != 0) {
            g_form.hideRelatedList('sn_ex_sp_m2m_portal_navigation_item_quicklink.navigation_menu_item');
        }
        if (navItemDisplayType == 'expanded' && depth != 1) {
            g_form.hideRelatedList('sn_ex_sp_m2m_portal_navigation_item_quicklink.navigation_menu_item');
        }
    } else {
        // hide related lists for top level menu item of type 'modal'
        g_form.hideRelatedList('sn_ex_sp_portal_extensible_navigation_item.parent_item');
        g_form.hideRelatedList('sn_ex_sp_m2m_portal_navigation_item_quicklink.navigation_menu_item');
    }
}
