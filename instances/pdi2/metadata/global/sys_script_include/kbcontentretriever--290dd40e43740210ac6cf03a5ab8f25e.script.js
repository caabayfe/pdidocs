var KBContentRetriever = Class.create();
KBContentRetriever.prototype = {
	initialize: function() {
	},

	getArticleContent: function(sysId) {
		var util = new KBViewModelSNC();
		return util.getArticleContentBySysId(sysId);
	},

    type: 'KBContentRetriever'
};
