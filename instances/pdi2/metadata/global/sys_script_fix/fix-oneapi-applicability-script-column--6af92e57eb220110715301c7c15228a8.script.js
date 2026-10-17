(function() {
	var gr = new GlideRecord('sys_dictionary');
	gr.get('4709915af926011018f97de5f998ed48');
	if (gr.isValid()) {
		var newDefaultValue = "(function(featureInput, previousFeatureOutputs) {/* customize condition logic here, return true or false */return true;})(featureInput, previousFeatureOutputs)";
		gr.setValue('default_value', newDefaultValue);
		gs.info(gr.update());
	}
})();
