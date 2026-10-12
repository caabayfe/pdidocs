var RecommendedActionEvaluator = Class.create();
RecommendedActionEvaluator.prototype = Object.extendsObject(sn_nb_action.RecommendedActionEvaluatorImpl, {
	initialize: function() {
		RecommendedActionEvaluatorImpl.prototype.initialize.call(this);
    },
    type: 'RecommendedActionEvaluator'
});
