function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    var table = g_form.getValue('table');
    var view = g_form.getValue('view');
    var workspace = g_form.getValue('workspace');

    var ga = new GlideAjax('WorkspaceFormsTabsList');
    ga.addParam('sysparm_name', 'getListAjax');

    ga.addParam("sysparm_table", table);
    ga.addParam("sysparm_view", view);
    ga.addParam("sysparm_workspace", workspace);
    ga.getXML(orderListParseAndSet);

    function orderListParseAndSet(response) {
        var result = Array.prototype.slice.call(response.responseXML.getElementsByTagName('item'));
        var list = result.map(function(item) {
            return {
                label: item.getAttribute("label"),
                value: item.getAttribute("value")
            };
        });

        g_form.setValue('default_tab_order', true);
        g_form.clearValue('default_tab_focus');
        g_form.setValue('tabs_order', list);
		var defaultTabFocus;
        list.forEach(function(item) {
            g_form.addOption('default_tab_focus', item.value, item.label);
			if (!defaultTabFocus)
				defaultTabFocus = item.value;
        });
		if (defaultTabFocus)
			g_form.setValue('default_tab_focus', defaultTabFocus);
    }

}
