answer = getStepCompletionPercentage('46c1b8b543e77110adf71f062bb8f26b');

function getStepCompletionPercentage(bestPracticeId){
var gr = new GlideRecord('sn_vsc_best_practice_configurations');
if (gr.get(bestPracticeId)) {
	if (gr.getValue('status') == 'completed') {
		var grSA = new GlideRecord('sys_audit');
		grSA.addEncodedQuery('tablename=sn_vsc_best_practice_configurations^fieldname=status^sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()^newvalue=completed^documentkey=' + bestPracticeId);
		grSA.query();
		if(grSA.hasNext()) {
			var stepData = new sn_vsc.SCPlaybookUtil().getBPStepData(bestPracticeId);
			return Math.round((stepData.completedSteps/stepData.totalSteps)*100,2);
		}
	}
}
return 0;
}
