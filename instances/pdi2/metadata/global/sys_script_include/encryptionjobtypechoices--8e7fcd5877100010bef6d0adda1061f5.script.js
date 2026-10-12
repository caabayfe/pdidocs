var EncryptionJobTypeChoices = Class.create();
EncryptionJobTypeChoices.prototype = {
	process: function() {
		var supportedChoices = new SNC.MassEncryptionJob().getSupportedJobTypeChoices();
		var choiceList = new GlideChoiceList();
		var jsonObj = JSON.parse(supportedChoices);
		for (var value in jsonObj)
			choiceList.add(value, jsonObj[value]);

		return choiceList;
	},

	type: 'EncryptionJobTypeChoices'
};
