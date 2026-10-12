var GetChoiceFields = Class.create();
GetChoiceFields.prototype = {
    initialize: function() {
    },

	process: function(tableName) {
		var fieldNames = [];
	
		if (!tableName)
			return fieldNames;
	
		var gr = new GlideRecord(tableName);
		if (!gr.isValid())
			return fieldNames;
	
		var elements = gr.getElements();

		// Scoped vs Global calls to getElements returns different objects
		var elementsLength = elements.size();
		for (var i = 0; i < elementsLength; i++) {
			var element = elements.get(i).getED();
			if (!element.isChoiceTable())
				continue;
	
			fieldNames.push(element.getName());
		}
	
		return fieldNames;
	},
	
    type: 'GetChoiceFields'
};
