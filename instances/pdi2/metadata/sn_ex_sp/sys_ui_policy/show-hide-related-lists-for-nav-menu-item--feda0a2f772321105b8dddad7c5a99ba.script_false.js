function onCondition() {
    var depth = Number(g_scratchpad.nav_item_depth);
    var hideRelatedLists = ((g_scratchpad.menu_type == 'scripted') || (g_scratchpad.menu_type == 'filtered')) ? true : false;

    g_form.hideRelatedList('sn_ex_sp_m2m_portal_navigation_item_quicklink.navigation_menu_item');

    if (hideRelatedLists || depth > 0 || g_form.getValue('render_as') == 'modal_window') {
        g_form.hideRelatedList('sn_ex_sp_portal_extensible_navigation_item.parent_item');
    }
}
