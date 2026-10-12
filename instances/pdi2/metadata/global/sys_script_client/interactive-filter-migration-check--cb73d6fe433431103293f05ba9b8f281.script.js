function onLoad() {
    //Type appropriate comment here, and begin script below
    var interactiveFilterSysId = g_form.getUniqueValue();;
    var gr = new GlideRecord('par_coreui_migration_bridge_component');
    gr.addQuery('filter', interactiveFilterSysId);
    gr.query();
    if (gr.next()) {
		if (gr.getValue('active') == 'next') {
			// Next experience is active
            migrated_filter_url = '/now/platform-analytics-workspace/filter-designer/' + gr.component;
            if (g_user.hasRole('hp_publisher_admin')) {
                g_form.addInfoMessage(getMessage('This interactive filter has been migrated to a next experience filter.')+' <a href="'+migrated_filter_url+'" target="_blank">'+getMessage('Click here to view the migrated filter.')+'</a>');
            } else {
                top.window.location = migrated_filter_url;
            }
        }
    }
}
