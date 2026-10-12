function onLoad() {
	var scoreType = '';
	var gr = new GlideRecord('asmt_metric_type');
	gr.get(g_form.getValue('metric_type'));
	scoreType = gr.scoring_type;
   g_form.setDisplay('scoring_type', (scoreType == 'percent'));
}
