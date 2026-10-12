var evaluationResult = (function() {
     /* Do not remove this line */
     var result = {evaluation: false, score: 0};

    /* Add your code here */
    var mttrScore = new RecommendationManager().getRecentScores('682283c26732220097eeff5557415a58');

    if (!mttrScore.isBetter)
        result = {evaluation: true, score: sn_bm_common.CommonConstants.RECO_SCALE_FACTOR};

    /* Do not remove this line */
    return result;
})();

/* Do not remove this line */
evaluationResult;
