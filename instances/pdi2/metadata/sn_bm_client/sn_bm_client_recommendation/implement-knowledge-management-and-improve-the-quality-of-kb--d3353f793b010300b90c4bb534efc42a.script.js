var evaluationResult = (function() {
     /* Do not remove this line */
     var result = {evaluation: false, score: 0};

    /* Add your code here */
	var threshold = 10;
	var timesViewed = 0;
	var ga = new GlideAggregate('kb_use');
	ga.addAggregate('SUM', 'times_viewed');
	ga.addEncodedQuery('sys_created_onONLast 3 months@javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()');
	ga.query();
	if (ga.next())
		timesViewed = ga.getAggregate('SUM', 'times_viewed');

	if (timesViewed < threshold) {
		result.evaluation = true;
		result.score      = sn_bm_common.CommonConstants.RECO_SCALE_FACTOR * (threshold - Number(timesViewed)) / threshold;
	}

    /* Do not remove this line */
    return result;
})();

/* Do not remove this line */
evaluationResult;
