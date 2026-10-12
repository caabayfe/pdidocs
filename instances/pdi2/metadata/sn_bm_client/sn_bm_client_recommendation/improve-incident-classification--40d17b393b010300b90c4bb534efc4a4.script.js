var evaluationResult = (function() {
     /* Do not remove this line */
     var result = {evaluation: false, score: 0};

    /* Add your code here */
	var threshold = 100;
	var assignment_group_count = 0;
	gr = new GlideRecord('sys_user_group');
	gr.addEncodedQuery('type=null^ORtype=1cb8ab9bff500200158bffffffffff62^EQ');
	gr.query();
	assignment_group_count = gr.getRowCount();

	if (assignment_group_count > threshold) {
		result.evaluation = true;
		result.score      = sn_bm_common.CommonConstants.RECO_SCALE_FACTOR * (Number(assignment_group_count) - threshold) / threshold;
	}
    /* Do not remove this line */
    return result;
})();

/* Do not remove this line */
evaluationResult;
