answer = true;
var act = current.activity;

if (act.workflow_version.checked_out == '' && act.workflow_version != '')
	answer = false;
