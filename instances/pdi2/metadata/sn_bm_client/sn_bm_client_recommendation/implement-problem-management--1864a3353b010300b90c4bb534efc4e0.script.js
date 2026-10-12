var evaluationResult = (function() {
     /* Do not remove this line */
     var result = {evaluation: false, score: 0};

    /* Add your code here */
	var gr = new GlideRecord('problem');
	gr.addEncodedQuery('sys_created_onONLast 3 months@javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()');
	gr.query();
	if (!gr.next()) {
		result.evaluation = true;
		result.score      = sn_bm_common.CommonConstants.RECO_SCALE_FACTOR;
	}
    /* Do not remove this line */
    return result;
})();

/* Do not remove this line */
evaluationResult;
