function generateDescription(step) {
    var mugshotLabel = new ATFCustomUIHelper().getComponentDescriptionFromCache(step.inputs.component, step.mugshots_cache_json);
	var use_label_path = GlideProperties.getBoolean('sn_atf.element.use_label_path', true);
	
	if (use_label_path === true) {
		var labelPath = new ATFCustomUIHelper().getComponentLabelPathFromCache(step.inputs.component, step.mugshots_cache_json);
		if (labelPath)
			return gs.getMessage("ATF_CUSTOM_UI:Confirm that the '{0}' component is {1}, Page area: '{2}'", [mugshotLabel, step.inputs.assert_type.replace("_", " "), labelPath]);
	}
	
	return gs.getMessage("Confirm that the '{0}' component is {1}", [mugshotLabel, step.inputs.assert_type.replace("_", " ")]);
}
generateDescription(step);
