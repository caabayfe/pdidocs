function onLoad() {
    //Type appropriate comment here, and begin script below
    var paWidgetSysId = g_form.getUniqueValue();;
    var gr = new GlideRecord('par_coreui_migration_bridge_component');
    gr.addQuery('widget', paWidgetSysId);
    gr.query();
    if (gr.next()) {
        if (gr.getValue('active') == 'next') {
			// Next experience is active
            var migrated_widget_url = '/now/platform-analytics-workspace/visualization-designer/' + gr.component;
            if (g_user.hasRole('pa_admin')) {
                g_form.addInfoMessage(getMessage('This pa widget has been migrated to a next experience visualization.')+' <a href="'+migrated_widget_url+'" target="_blank">'+getMessage('Click here to view the migrated widget visualization.')+'</a>');
            } else {
                top.window.location = migrated_widget_url;
            }
        }
    }
}
