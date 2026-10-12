var ResolutionFrameworkClassificationTypeChoices = Class.create();
ResolutionFrameworkClassificationTypeChoices.prototype = {
	process: function() {
		var supportedChoices = new SNC.KMFErrorFrameworkAPI().getSupportedErrorClassifications();
		var choiceList = new GlideChoiceList();
		var jsonObj = JSON.parse(supportedChoices);
		for (var value in jsonObj)
			choiceList.add(value, jsonObj[value]);

		return choiceList;
	},

	type: 'ResolutionFrameworkClassificationTypeChoices'
};
