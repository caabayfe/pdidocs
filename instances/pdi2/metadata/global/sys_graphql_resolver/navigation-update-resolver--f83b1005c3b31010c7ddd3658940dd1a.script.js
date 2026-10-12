(function process(env) {	
	var sysId = env.getArguments().sysId;
		
	function getPagePropertyRecord(id, name) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', name);
		gr.addQuery('page', id);	
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) { 	
			return gr;
		}		
		return false;		
	}
	
	function updateRecord(sysId, type, parent, key, value) {
		var gr = getPagePropertyRecord(sysId, type);
		var settings = JSON.parse(gr.getValue('value'));
		if (Array.isArray(key)) {
			var count;
			for (count = 0; count < key.length; count++) {
                settings[parent][key[count]] = value[count];
			}
		} else {
			settings[parent][key] = value;
		}		
		gr.setValue('value', JSON.stringify(settings));
		gr.update();		
	}

	updateRecord(sysId, 'chrome_header', 'publicPage', 'menuEnabled', env.getArguments().menu);
	updateRecord(sysId, 'chrome_footer', 'public_page', ['enable_footer_topbar', 'enable_footer_bar'], [env.getArguments().footerTop, env.getArguments().footerBottom]);
	var menu = getPagePropertyRecord(sysId, 'chrome_menu');
	
	return {
		headerSysId: header.getValue('sys_id'),
		menu: env.getArguments().menu,
		menuSysId: menu.getValue('sys_id'),
		footerTop: env.getArguments().footerTop,
		footerBottom: env.getArguments().footerBottom,
		footerSysId: footer.getValue('sys_id')
	};

})(env);
