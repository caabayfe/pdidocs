(function suiteComponentFunction(params) {
    var gtpce = new global.TreePickerUtils(params.table, params.referenceField, params.sysId, params.serializedChanges, params.encodedRecord);
	return gtpce.isTreePicker();
})(inputProperties.payload);
