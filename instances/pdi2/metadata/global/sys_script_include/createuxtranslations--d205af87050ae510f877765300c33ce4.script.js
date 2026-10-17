var CreateUXTranslations = Class.create();
CreateUXTranslations.prototype = {
    initialize: function() {},

    getRequiredTranslations: function(script, type) {

          /* Regex Explanation:
          * ----------------------
          * helpers\.translate : exact match of "helpers.translate"
          * (?:Sync)? : optional exact match of "Sync" (e.g., helpers.translateSync for transform scripts)
          * \s* : any whitespace before the opening parenthesis
          * \( : exact match of "("
          * \s* : any whitespace after the opening parenthesis
          * (?:(['"])((?:(?!\1).)*)\1|(\{[\s\S]*?\})) : non-capturing group with alternation:
          *    (['"])((?:(?!\1).)*)\1 : matches a string literal:
          *         (['"]) : capturing group 1 - opening quote (single or double)
          *         ((?:(?!\1).)*) : capturing group 2 - matches any character until the matching closing quote, using negative lookahead
          *         \1 : reference to capturing group 1 (the matching closing quote)
          *    | (\{[\s\S]*?\}) : capturing group 3 - matches an object literal (non-greedily between { and })
          * (?:\s*,.*?)? : optional non-capturing group for additional arguments
          * \s*\) : closing parenthesis with optional whitespace
          * (?:\.\w+.*)? : optional trailing promise arguments ".then({...})"
          */
		var functionRegex = /helpers\.translate(?:Sync)?\s*\(\s*(?:(['"])((?:(?!\1).)*)\1|(\{[\s\S]*?\}))(?:\s*,.*?)?\s*\)(?:\.\w+.*)?/g;
		// create a "clean" object with no prototype to avoid conflicts with inherited properties
        var uniqueMessages = Object.create(null);
        var translations = [];
        var match;
        while ((match = functionRegex.exec(script)) !== null) {
            var key;
            var message;
            if (match[2] !== undefined) {
                message = match[2].trim();
                key = message;
            } else {
                try {
                    var obj = JSON.parse(match[3]);
                    if (obj.code != null && obj.code !== "") {
                        key = obj.code + ":" + obj.message;
                    } else {
                        key = obj.message;
                    }
                    message = obj;
                } catch (ignored) {
                    // ignore invalid JSON
                    continue;
                }
            }
            if (!uniqueMessages[key]) {
                uniqueMessages[key] = true;
                if (typeof message === 'object' && message !== null) {
                  if (typeof message.message !== 'string') continue;
                  var filteredMessage = { message: message.message };
                  if (message.code !== undefined) filteredMessage.code = message.code;
                  if (message.comment !== undefined) filteredMessage.comment = message.comment;
                  translations.push(filteredMessage);
                } else {
                    translations.push({ message: message });
                }
            }
        }
        return translations;
    },

    type: 'CreateUXTranslations'
};
