var SigningJobTypeChoices = Class.create();
SigningJobTypeChoices.prototype = {
	process: function() {
		var supportedChoices = new SNC.SigningJob().getSupportedJobTypeChoices();
		var choiceList = new GlideChoiceList();
		var jsonObj = JSON.parse(supportedChoices);
		for (var value in jsonObj)
			choiceList.add(value, jsonObj[value]);

		return choiceList;
	},

    type: 'SigningJobTypeChoices'
};
