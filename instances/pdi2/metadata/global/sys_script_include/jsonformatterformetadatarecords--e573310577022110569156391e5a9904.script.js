var JsonFormatterForMetadataRecords = Class.create();
JsonFormatterForMetadataRecords.prototype = {
    initialize: function() {
    },

	getFieldType: function (glideElement) {
		return glideElement.getED().getInternalType();
    },

	replace: function (_, value) {
		if (value instanceof Object && !(value instanceof Array)) {
			return Object.keys(value)
				.sort()
				.reduce(function (sorted, key) {
					sorted[key] = value[key];
					return sorted;
				}, {});
		}
		return value;
    },

    formatJsonRecord: function(record) {
        for (var field in record) {
			var glideElement = record.getElement(field);
			if (glideElement && this.getFieldType(glideElement) == "json") {
				var jsonData = JSON.parse(record[field]);
				var formattedValue = JSON.stringify(jsonData, this.replace, 4);
				record[field] = formattedValue;
            }
        }
    },

    type: 'JsonFormatterForMetadataRecords'
};
