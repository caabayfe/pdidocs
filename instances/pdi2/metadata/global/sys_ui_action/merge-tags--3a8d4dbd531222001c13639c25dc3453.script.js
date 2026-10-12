function merge() {
	var labelIds = g_list.getChecked();
	if (!labelIds || labelIds.length == 0)
		return;
	
	var targetTagInput = new GlideModal("merge_tags_input_v3", false, 400);
	targetTagInput.setTitle(g_i18n.getMessage("Enter tag to merge other tag(s) into"));
	targetTagInput.setPreference("onPromptComplete", function(targetLabel) {
		
		var mergeFunction = new GlideAjax("LabelMergeAjax");
		mergeFunction.addParam("sysparm_name", "mergeLabels");
		mergeFunction.addParam("sysparm_labelIds", labelIds);
		mergeFunction.addParam("sysparm_targetLabel", targetLabel);
		
		mergeFunction.getXML(function() {
			g_navigation.reloadWindow();
		});
		return true;
	});
	
	targetTagInput.render();
}
