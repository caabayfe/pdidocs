if (current.name == 'UA Platform Analytics Timed Uploader' && current.system_id != 'ALL NODES') {
	// UA upload job, so randomize the minute
	var offsetMinute = getRandomMinute();
		
	gs.log('Adding ' + offsetMinute + ' minutes for ' + current.name  +' on node ' + current.system_id);
		
	var newNextAction = gs.dateAdd('minute', offsetMinute, current.getValue('next_action'));
		
	current.setValue('next_action', newNextAction);
	current.update();
	
}

function getRandomMinute() {
	var minMinute = 1;
	var maxMinute = 59;
	
	return Math.floor(Math.random() * (maxMinute - minMinute + 1)) + minMinute;
}
