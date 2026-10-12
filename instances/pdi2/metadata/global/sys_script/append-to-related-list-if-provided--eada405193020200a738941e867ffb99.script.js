(function executeRule(current, previous /*null when async*/) {

	var relatedList = current.related_list.toString();
	current.related_list = null;
	
	var gr = new GlideRecord('sys_ui_related_list');
	if(!gr.get(relatedList))
		return;
	
	var relatedListTable = gr.name.toString();
	var targetTable = current.basic_apply_to.toString();
	// if relatedListTable is not an extending table of targetTable then finished
	if(!GlideDBObjectManager.get().getAllExtensions(targetTable).contains(relatedListTable))
		return;
	
	// append this relationship to the related list
	gr = new GlideRecord('sys_ui_related_list_relationship_entry');
	gr.sys_relationship = current.getUniqueValue();
	gr.sys_ui_related_list = relatedList;
	gr.insert();
	
	// flush the form cache
	GlideCacheManager.flush('sys_script_client');	

})(current, previous);
