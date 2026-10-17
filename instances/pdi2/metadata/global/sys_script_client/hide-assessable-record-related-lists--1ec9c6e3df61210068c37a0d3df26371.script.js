function onLoad() {
   // If this is an attestation, hide assessable records related list, as irrelevant
	var objView = document.getElementById('sysparm_view'); 
	var strView = objView.getAttribute('value'); 
	if ((strView.toLowerCase() == 'attestation') || (strView.toLowerCase() == 'test_plan') || (strView.toLowerCase() == 'quiz')) 
		g_form.hideRelatedList("asmt_assessable_record.metric_type");
}
