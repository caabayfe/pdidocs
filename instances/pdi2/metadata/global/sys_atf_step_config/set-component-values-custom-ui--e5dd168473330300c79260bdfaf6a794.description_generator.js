function generateDescription() {
	var conditions = new ATFCustomUIHelper().getQueryStringMugshotDescription(step.inputs.component_values, step.mugshots_cache_json);
	var conditionsWithLabelPath = new ATFCustomUIHelper().getQueryStringMugshotDescriptionWithLabelPath(step.inputs.component_values, step.mugshots_cache_json);
	var use_label_path = GlideProperties.getBoolean('sn_atf.element.use_label_path', true);
	if (use_label_path === true && conditionsWithLabelPath)
		return gs.getMessage("Set the components on the page as follows:\n{0}", conditionsWithLabelPath);

	return gs.getMessage("Set the components on the page as follows:\n{0}", conditions);
}
generateDescription();
