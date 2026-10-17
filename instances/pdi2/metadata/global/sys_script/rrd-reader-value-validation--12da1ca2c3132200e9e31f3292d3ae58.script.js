(function executeRule(current, previous /*null when async*/) {
	var writer = gs.getProperty('glide.rrd.writer');
	if (writer == 'dual')
		return;
	
	if (current.value == 'rrd' && writer != 'clotho') //non clotho value would be default to rrd
		return;		
	
	if (current.value == 'clotho' && writer == 'clotho' || writer == 'dual_jrobin')
		return;
	
	current.setAbortAction(true);
	var message = gs.getMessage('Cannot set reader to {0} while there is no data write to it. Current writer: {1}', [current.value, writer]);
	gs.addErrorMessage(message);

})(current, previous);
