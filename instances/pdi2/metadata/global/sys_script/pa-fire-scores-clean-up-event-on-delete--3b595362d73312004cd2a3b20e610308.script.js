(function executeRule(current, previous /*null when async*/) {
	
	gs.eventQueue('pa.delete.indicator_breakdown', '', '', current.indicator + ';' + current.indicator.id, current.breakdown + ';' + current.breakdown.id);

})(current, previous);
