var PlatformEncryptedFields = Class.create();
PlatformEncryptedFields.prototype = {

	process: function(dependent_value) {
		var choiceList = new GlideChoiceList();
		if (dependent_value !== null){
		  var columnData = new SNC.MassEncryptionJob().getSupportedFieldChoicesForTable(dependent_value);
		  var columnJson = JSON.parse(columnData);

		  for (var columnValue in columnJson)
		    choiceList.add(columnValue, columnJson[columnValue]);
        }
		return choiceList;
	},

    type: 'PlatformEncryptedFields'
};
