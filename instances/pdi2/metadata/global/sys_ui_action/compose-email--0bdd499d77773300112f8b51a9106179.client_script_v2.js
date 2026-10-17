function onClick(g_form) {
	var LEGACY_EMAIL_CLIENT_NAME = 'sn-email-editor',
		SEISMIC_EMAIL_CLIENT_NAME = 'sn-email-client-wrapper',
		EMAIL = 'sys_email',
		DRAFT = 'sys_email_draft',
		tValue = DRAFT;

	//get the list of renderers
	var renderers = [];
	if (ux_globals && ux_globals.presource['sn-workspace-content:snCustomRenderer']) {
		renderers = ux_globals.presource['sn-workspace-content:snCustomRenderer'].data.GlideRecord_Query.sys_aw_renderer._results;
	}

	if (renderers.length > 0) {
		// Filter out Email renderers
		var renderMap = {};
		renderers.filter(function(o) {
			return o.table.value == EMAIL || o.table.value == DRAFT;
		}).map(function(o) {
			renderMap[o.table.value] = o.custom_renderer_tag.value;
		});

		//Figure out the final value
		if (!renderMap.hasOwnProperty(DRAFT))
			tValue = EMAIL;
		else {
			if (!renderMap.hasOwnProperty(EMAIL))
				tValue = DRAFT;
			else if (renderMap[EMAIL] == LEGACY_EMAIL_CLIENT_NAME)
				tValue = EMAIL;
		}
	}
	
	var dirtyFieldList = g_form.serialize(true).map(function(field) {
		return {
			field: field.name,
			value: field.value
		};
	});
	g_aw.openRecord(tValue, '-1', {parentTable: g_form.getTableName(), parentSysId: g_form.getSysId(), headerValue: getMessage("New Email"), dirtyFields: dirtyFieldList});
}
