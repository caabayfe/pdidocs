function transform(input) {
    var util = new global.ACEAppBuilderGlobalScopedUtil();
	var CONSTANTS = new ACEAppBuilderMetaData();

    var output = {
        experienceId: '',
        appConfig: input.uxAppConfigId
    };
    var uxAppConfigId = input.uxAppConfigId;
	var appShellId = input.appShellUI;

    var expGr = new GlideRecord('sys_ux_page_registry');
    if (!uxAppConfigId || !expGr.canWrite() || !expGr.canRead()) {
        output.status = "Failed to create experience";
        return output;
    }

    expGr.addQuery('admin_panel', uxAppConfigId);
    expGr.query();
    if (expGr.next()) {
		var parentApp = '';
		
		if (!appShellId)
			appShellId = CONSTANTS.BASE_UXF_RECORDS.DEFAULT_APP_SHELL_UI;
		
		var _appShells = CONSTANTS.BASE_UXF_RECORDS.APP_SHELLS;
		for (var i = 0; i < _appShells.length; i++) {
			var appShellObj = _appShells[i];
			if (appShellObj && appShellObj.id === appShellId) {
				parentApp = appShellObj.parentApp;
				break;
			}
		} 
		if (!parentApp) 
			parentApp = CONSTANTS.BASE_UXF_RECORDS.DEFAULT_PARENT_APP;
		
		util.updateRecord('sys_ux_page_registry', expGr.getValue('sys_id'), {"parent_app": parentApp});
        output.experienceId = expGr.getValue('sys_id');
		
		var chromeHeaderPagePropertyPayload = {
            'page': expGr.getValue('sys_id'),
            'name': 'chrome_header',
            'type': 'json',
            'value': JSON.stringify(CONSTANTS.CHROME_HEADER_VALUE),
        };
		util._grRecordCreator('sys_ux_page_property', chromeHeaderPagePropertyPayload);
    }

    return output;
}
