var CatalogItemReviewUtil = Class.create();
CatalogItemReviewUtil.prototype = {
    initialize: function() {
    },

	getFlow: function(itemId) {
		return gs.getProperty('glide.sc.builder.item_review_flow', 'f6c1bd8e87322010c84e4561d5cb0b70');
	},
	
    type: 'CatalogItemReviewUtil'
};
