var NextBestActionRankingImpl = Class.create();
NextBestActionRankingImpl.prototype = {
    initialize: function() {},
    getActionScore: function(actionOrders) {
        var intraRuleStep = parseFloat(gs.getProperty(sn_nb_action.Constants.RECOMMENDATION_ORDER_WEIGHT));
        var interRuleStep = parseFloat(gs.getProperty(sn_nb_action.Constants.RULE_ORDER_WEIGHT));
        var frequencyWeight = parseFloat(gs.getProperty(sn_nb_action.Constants.FREQUENCY_WEIGHT));
        var frequency = actionOrders.length,
            max = 0,
            finalScore;
        for (var i = 0; i < frequency; i++) {
            var intraOrder = actionOrders[i].getIntraOrder();
            var interOrder = actionOrders[i].getInterOrder();
            var currentScore = Math.pow(intraRuleStep, intraOrder - 1) * Math.pow(interRuleStep, interOrder - 1);
            if (currentScore > max)
                max = currentScore;
        }
        finalScore = max + frequency * frequencyWeight;
        return finalScore;
    },

    type: 'NextBestActionRankingImpl'
};
