var AISGeniusResultConfigParamsUtil = Class.create();
AISGeniusResultConfigParamsUtil.prototype = {
	initialize: function (paramJson) {
		try {
			this.parsedJson = JSON.parse(paramJson);
		} catch (ex) {
			gs.error('Unable to parse GR config parameters. Exception: ' + ex);
		}
	},

	/**
	 * jsonPath - E.g., semantic.threshold
	 */
	getValueOrDefault: function (jsonPath, defaultValue) {
		if (!this.parsedJson)
			return defaultValue;

		if (gs.nil(jsonPath))
			return defaultValue;

		var jsonPathParts = jsonPath.split('.');
		var value = this.parsedJson;
		for (var idx = 0; idx < jsonPathParts.length; idx++) {
			var tmpValue = value[jsonPathParts[idx]];
			if (gs.nil(tmpValue))
				return defaultValue;

			value = tmpValue;
		}

		return value;
	},

	type: 'AISGeniusResultConfigParamsUtil'
};
