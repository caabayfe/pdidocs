(function executeRule(current, previous /*null when async*/) {
	var documentSysId = current.document;
	
	var docGR = new GlideRecord("ds_document");
	if (docGR.get(documentSysId)) {
		if (docGR.default_version == current.sys_id) {
			var versions = new GlideRecord("ds_document_version");
			versions.addQuery('sys_id','NOT IN', current.sys_id);
			versions.addQuery('document',documentSysId);
			versions.orderByDesc("version_number");
			versions.setLimit(1);
			versions.query();

			if (versions.next()) {
				docGR.default_version = versions.sys_id;
				docGR.update();
			} else {
				docGR.default_version="";
				docGR.update();
			}
		}
	}
})(current, previous);
