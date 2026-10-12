var evaluationResult = (function() {
     /* Do not remove this line */
     var result = {evaluation: false, score: 0};

    /* Add your code here */
	var hasMobileDevice = true;
	var gr = new GlideRecord('sys_mobile_devices');
	gr.query();
	if (gr.getRowCount() == 0)
		hasMobileDevice = false;

	var is_m_enabled = true;
	gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'glide.ui.m_enabled');
	gr.query();
	if (gr.next())
		is_m_enabled = gr.getValue('value') == 'true' ? true : false;

	result.evaluation = !hasMobileDevice || !is_m_enabled;
	result.score      = (result.evaluation) ? sn_bm_common.CommonConstants.RECO_SCALE_FACTOR : result.score;
    /* Do not remove this line */
    return result;
})();

/* Do not remove this line */
evaluationResult;
