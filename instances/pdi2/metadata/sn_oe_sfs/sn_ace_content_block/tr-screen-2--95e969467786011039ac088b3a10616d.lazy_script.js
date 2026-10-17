(function(context) {

    var fetchTR = new sn_oe_sfs.FetchRecommendationDetails();
    var topThreeRecommendations = fetchTR.getTopThreeRecommendations();
    var requestsHandled = fetchTR.getRequestsHandledCount(topThreeRecommendations);
    var totalRequests = fetchTR.getTotalRequestsCount();
    var percentageOfRequestsBotCanSolve = fetchTR.getPercentageOfRequestsBotCanSolve(requestsHandled, totalRequests);
    percentageOfRequestsBotCanSolve = '<b>' + percentageOfRequestsBotCanSolve + '</b>';
    context.props_details.image = '/images/ci_landingexp_tr_addtopics.png';
    context.props_details.info = gs.getMessage('Users could resolve {0}% of their own incidents if you added these pre-built topics.', percentageOfRequestsBotCanSolve);
    context.props_details.list_items = topThreeRecommendations.map(function(recommendation) {
        return '<p style="font-weight: 600; margin-bottom: 0.75rem;">' + recommendation.topicName + '</p>';
    });

})(context);
