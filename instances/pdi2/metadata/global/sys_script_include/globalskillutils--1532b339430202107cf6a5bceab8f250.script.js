var GlobalSkillUtils = Class.create();
GlobalSkillUtils.prototype = {
    initialize: function() {
    },

	getTinyID: function(table, query, listID, listTitle, path, actionConfigId) {
		return SNC.ListTinyIDScriptObject.getTinyID(table, query, listID, listTitle, path, actionConfigId);
	},

	guessTable: function(utterance) {
		var tables = JSON.parse(SNC.NLQJavascriptProcessor.findDrivingTables(utterance, 'AC'));
		var result = '[';
		var hasResult = false;
		for (var i = 0; i < tables.length; i++) {
			var grs = GlideRecordSecure(tables[i]);
			if (grs.canRead()) {
				if (hasResult == false)
					result += (tables[i]);
				else
					result += (',' + tables[i]);

                                if (hasResult == false)
				        hasResult = true;
			} 	
		}
		result += ']';
		return result;
	},

	generateQuery: function(utterance, table) {
		var result = SNC.NLQJavascriptProcessor.apply(table, utterance, 'AC');
		return result.get('parserOutput');
	},

    type: 'GlobalSkillUtils'
};
