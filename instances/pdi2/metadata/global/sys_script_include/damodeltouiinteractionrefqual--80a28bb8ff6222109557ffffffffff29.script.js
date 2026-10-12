var DAModelToUIInteractionRefQual = Class.create();
DAModelToUIInteractionRefQual.prototype = {
    initialize: function() {},
	// Returns reference qualifier for ui interaction related list using the modelId
	getApplicableInteractionsRefQual: function(modelId) {
		// Form Model
		if (modelId.equals("360935e9534723003eddddeeff7b127d")) return "active=true^type=2b618365ff7222109557fffffffffffd^ORtype=3d914765ff7222109557ffffffffffa9^EQ";
		// List and Related List Model
		if (modelId.equals("d91731a9534723003eddddeeff7b121c") || modelId.equals("c3547169534723003eddddeeff7b126c")) return "active=true^type=2b618365ff7222109557fffffffffffd^ORtype=7b91c765ff7222109557ffffffffffc5^EQ";
		return "active=true^EQ";
	},
    type: 'DAModelToUIInteractionRefQual'
};
