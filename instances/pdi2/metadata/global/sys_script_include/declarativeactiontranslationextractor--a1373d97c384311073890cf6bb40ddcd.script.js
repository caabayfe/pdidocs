var DeclarativeActionTranslationExtractor = Class.create();
DeclarativeActionTranslationExtractor.prototype = {

	//This is a fairly robust regex intended to match a translate() call
	//and capture the argument being passed to it. It accounts for leading
	//and trailing whitespace, single and double quotes, and an optional semicolon.
	//A simple example of what would be matched is translate("foo") and foo would be
	//captured by the capture group.
	// DEF0779975: Regex updated to handle: translate(\"String to translate\")
	// As a result, String to translate is now in the 2nd capture group (index 2 in regex match)
	REGEX : /^\s*translate\((\\"|'|")(.+?)\1\);?\s*$/,

    initialize: function() {
    },

	// Main function that converts an array of values into their translated equivalents
	getTranslationsFromArray: function(array, scope, previousRequiredTranslations) {
		var previousTranslationObjects;
		try {
			previousTranslationObjects = JSON.parse(previousRequiredTranslations);
		} catch(error) {
			gs.warn("Error parsing previous record's required translations", error);
			previousRequiredTranslations = [];
		}

		var translationsArray = [];

		for(var i = 0; i < array.length; i++) {
			var value = array[i];
			var found = value ? value.match(this.REGEX) : undefined;
			if(found && found[2]) {
				var translationObject = undefined;
				for(var j = 0; j < previousTranslationObjects.length; j ++) {
					if(previousTranslationObjects[j].message === found[2]) {
						translationObject = previousTranslationObjects[j];
						break;
					}
				}

				if(!translationObject) {
					translationObject = {
						message: found[2],
						code: scope,
						comment: ""
					};
				}

				translationsArray.push(translationObject);
			}
		}
		return translationsArray;
	},

	// Used for extrating translations from a query string, such as payload_map.
	getTranslations: function(queryString, scope, previousRequiredTranslations) {
		var query = new GlideQueryString(queryString);
		query.deserialize();
		var terms = query.getTerms().toArray();
		var termValues = [];
		for(var i = 0; i < terms.length; i++) {
			var term = terms[i];
			termValues.push(term.getValue());
		}

		return getTranslationsFromArray(termValues, scope, previousRequiredTranslations);
	},

    type: 'DeclarativeActionTranslationExtractor'
};
