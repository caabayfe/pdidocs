var PopularTopicsUtil = Class.create();
PopularTopicsUtil.prototype = Object.extendsObject(PopularTopicsUtilSNC, {
    initialize: function() {
		PopularTopicsUtilSNC.prototype.initialize.apply(this, arguments);
    },
	
	getPopularTopicSysIds: function () {
		var sysIds = [];
		var MAX_POPULAR_TOPICS_LIMIT = 6; 
		var mespPortalTaxonomy = (new global.TaxonomyMobileUtil()).getMobileServicePortalTaxonomy();
		if (mespPortalTaxonomy) {
			var popularTopics = this.getPopularTopics(
				mespPortalTaxonomy,
				MAX_POPULAR_TOPICS_LIMIT, 
				true
			);
			for (var index=0; index<popularTopics.length; index++)
			sysIds.push(popularTopics[index].topicId);
		}
		return sysIds;
	},

    type: 'PopularTopicsUtil'
});
