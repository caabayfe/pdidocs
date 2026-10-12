(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.isModelDefDirty = current.parent_model_def.dirty == true;
	
	var grVersion = new GlideRecord('promin_model_def_version');
    grVersion.addQuery('model_def', current.getValue("parent_model_def"));
    grVersion.query();
    g_scratchpad.isVersionPresent = grVersion.hasNext();

})(current, previous);
