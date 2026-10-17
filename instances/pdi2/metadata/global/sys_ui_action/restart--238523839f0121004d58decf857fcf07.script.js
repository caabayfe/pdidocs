(function() {
	var context = new MIDExtensionContext(current);
	if (current.status == 'Stopped' || current.status == 'Offline' ||current.status == 'Error' || current.status == '' )
		context.start();
	else if (current.status == 'Starting' || current.status == 'Restarting')
		gs.addInfoMessage(gs.getMessage("vCenter event collector {0} is already being started/restarted.", current.name));
	else if (current.status == 'Started' )
		context.restart();
}());
