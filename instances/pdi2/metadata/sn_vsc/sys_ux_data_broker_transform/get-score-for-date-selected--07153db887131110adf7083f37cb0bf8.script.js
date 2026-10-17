function transform(input) {
	var date = input.dates;
	if (!date) {
		return '';
	}
	var startTime = "00:00:00";
	var endTime = "23:59:59";
	var score = "";
	var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
	var records = "harc_collectedON" + date + "@javascript:gs.dateGenerate('" + date + "','" + startTime + "')@javascript:gs.dateGenerate('" + date + "','" + endTime + "')";
	gr.addEncodedQuery(records, true);
	gr.orderByDesc('harc_collected');
	gr.setLimit(1);
	gr.query();
	if(gr.next()){
		score = gr.getDisplayValue('harc_score').toString() + "%";
	}
	return score;
}
