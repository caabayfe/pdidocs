(function executeRule(current, previous /*null when async*/) {
	
	gs.eventQueue('pa.delete.breakdown', '', '', current.getValue('sys_id') + ';' + current.getValue('id'));

})(current, previous);
