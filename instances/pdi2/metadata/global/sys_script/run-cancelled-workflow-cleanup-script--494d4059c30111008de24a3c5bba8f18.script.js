executeOnCancelScript();

function executeOnCancelScript() {
    var script = current.workflow_version.on_cancel + '';
	if (!isExecutable(script))
		return;
	
	// Prepend global variable containing context sys_id
	script = "var context_sys_id = '" + current.getUniqueValue() + "';\n" + script;
	
    var sched = new ScheduleOnce();
    sched.script = script;
    sched.setTime(new GlideDateTime().add(2000));
    sched.setDocument(current);
    sched.setLabel("WFCancel" + current.sys_id);
	sched.schedule();
	
	function isExecutable(script) {
		var lines = script.split('\n');
		var line;
		for (var i=0; i<lines.length; i++) {
			line = lines[i].trim();
			if (line.length>0 && line.substr(0,2) != "//")
				return true;
		}
		return false;
	};
}
