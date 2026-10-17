(function executeRule(current, previous /*null when async*/) {
	var reader = gs.getProperty('glide.rrd.reader');
	if (current.value == 'dual')
		return;
	
	if (current.value != 'clotho' && current.value != 'dual_jrobin' && reader == 'clotho') {
		var message1 = gs.getMessage('Switch {0} to {1} due to writer property update', ['glide.rrd.reader', 'rrd']);
		gs.addInfoMessage(message1);
		gs.setProperty('glide.rrd.reader', 'rrd');
		return;
	}
	
	if (current.value == 'clotho' && reader != 'clotho') {
		var message2 = gs.getMessage('Switch {0} to {1} due to writer property update', ['glide.rrd.reader', 'clotho']);
		gs.addInfoMessage(message2);
		gs.setProperty('glide.rrd.reader', 'clotho');
		return;
	}

})(current, previous);
