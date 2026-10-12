(function suiteComponentFunction(params) {
    var gtpce = new GlideTreePickerConfigEvaluator(params.table, params.referenceField, params.sysId, params.serializedChanges, params.encodedRecord);
	return !gtpce.isTreePicker();

})(inputProperties);
