(function executeRule(current, previous /*null when async*/) {

	if(!current.version.nil() && current.version!=''){
		var gr = new GlideRecord(current.sys_class_name);
		gr.addQuery('version',current.version);
		gr.query();
		if(gr.next()){
			//Means someone is trying to copy a record (for eg:- Insert and Stay UI actions)
			// Reset the versioning related fields and start a new version
			current.version = 'NULL';
			current.article_id = 'NULL';
			current.summary = 'NULL';
			current.base_version = 'NULL';
			current.latest = 'true';
			current.revised_by = '';	
		}
	}

})(current, previous);
