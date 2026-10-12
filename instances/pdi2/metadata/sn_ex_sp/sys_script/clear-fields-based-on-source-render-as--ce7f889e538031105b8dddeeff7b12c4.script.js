(function executeRule(current, previous /*null when async*/ ) {

    if (current.navigation_item_type == 'menu') {
        current.topic = '';
    } else {
        current.menu = '';
    }
    if (current.render_as == 'menu') {
        current.widget = '';
        current.widget_parameters = '';
    } else {
        current.browse_button = '';
        current.submenu_type = '';

        var extensibleItemGr = new GlideRecord('sn_ex_sp_portal_extensible_navigation_item');
        extensibleItemGr.addEncodedQuery('portal_extensible_navigation=' + current.portal_extensible_navigation + '^parent_item=' + current.getUniqueValue(), true);
        extensibleItemGr.query();
        if (extensibleItemGr.hasNext()) {
            extensibleItemGr.deleteMultiple();
        }
    }

})(current, previous);
