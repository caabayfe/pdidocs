function generateDescription() {
    var mugshotLabel = new ATFCustomUIHelper().getComponentDescriptionFromCache(step.inputs.component, step.mugshots_cache_json);
	var use_label_path = GlideProperties.getBoolean('sn_atf.element.use_label_path', true);
	if (use_label_path === true) {
		var labelPath = new ATFCustomUIHelper().getComponentLabelPathFromCache(step.inputs.component, step.mugshots_cache_json);
		if (labelPath)
			return gs.getMessage("ATF_CUSTOM_UI:Click the component: '{0}', Page area: '{1}'", [mugshotLabel, labelPath]);
	}
	
	return gs.getMessage("Click the component: '{0}'", mugshotLabel);
}
generateDescription();
