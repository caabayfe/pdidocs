(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (current._operation() == 'delete')
		SNC.RCAScriptUtils.deleteRequestedRCA(current);
	else
		SNC.RCAScriptUtils.updateRequestedRCA(previous, current);

})(current, previous);
