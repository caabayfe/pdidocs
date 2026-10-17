function onBefore(current, previous) {
	var match = new GlideRecord('sys_ws_operation');
	match.addQuery('web_service_definition', current.web_service_definition);
	match.addQuery('http_method', current.http_method);
	match.addQuery('sys_id', '!=', current.sys_id);
	match.addQuery('web_service_version', current.web_service_version);
	match.addActiveQuery();
	match.query();
	while (match.next()) {
		if (SNC.GlideRouteTemplateMatcher.matchTemplates(match.relative_path, current.relative_path)) {
			current.setAbortAction(true);
			gs.addErrorMessage("HTTP method and Relative path '" + current.relative_path + "' conflict with another resource. Choose another method or path.");
			break;
		}
	}
}
