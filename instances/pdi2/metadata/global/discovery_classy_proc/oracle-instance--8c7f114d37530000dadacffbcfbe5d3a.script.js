if(type == 'unix') {
	var matches = command.match(/^ora_pmon_(\w+)$/);
	if (matches) {
		current.sid = matches[1];
		g_probe_parameters.sid = current.sid;
		current.name = current.sid + "@" + g_sensor.deviceGR.name;
	}
} else if(type == 'windows'){
	var matches = parameters.match(/oracle\.exe\s(\w+)/i);
	if (matches) {
		current.sid = matches[1];
		current.name = current.sid + "@" + g_sensor.deviceGR.name;
		g_probe_parameters.sidVal = current.sid;
		g_probe_parameters.commandVal = command;
		current.install_directory = command.replace(/\\bin\\oracle\.exe/i, "");
		if (gs.nil(g_probe_parameters.sidVal))
			g_sensor.warn("Value for SID is empty. Invocation of Probe 'WMIRunner-Oracle - Instance PFile' is skipped.");
	}
}
