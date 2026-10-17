var EvtMgmtRegexTest = Class.create();
EvtMgmtRegexTest.prototype = {
    initialize: function() {
	},

	//Checks if the text matches a regex, if matches, the script prints the matching groups.
    test: function(regex, text) {
        var erm = new SNC.EventRuleManager();
        var res = erm.testRegex(regex, text);
		gs.print(res);
		return res;
    },

	getPreprocessedText: function(text) {
        return new SNC.EventRuleManager().getPreprocessedText(text);
    },

    // NOTE: This function duplicates the regex-matching logic used in Event Processing.
    //       If the original implementation is updated, ensure these changes are
    //       reflected here as well to maintain consistent behaviour.
    processTextAndTestRegex: function(regex, text) {
        return new SNC.EventRuleManager().processTextAndTestRegex(regex, text);
    },

    type: 'EvtMgmtRegexTest'
};
