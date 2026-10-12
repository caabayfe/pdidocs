if(isUnique()){
	var msg = gs.getMessage('There is already a target value set for this date');
	gs.addInfoMessage(msg);
	current.setAbortAction(true);
}
function isUnique(){
	var targetValue = new GlideRecord('pa_target_values');
	targetValue.addQuery('sys_id', '!=', current.sys_id);
	targetValue.addQuery('target', current.target);
	targetValue.addQuery('target_at', current.target_at);
	targetValue.query();
	return targetValue.hasNext();
}
