(function executeRule(current, previous /*null when async*/) {
	var probe_response = SncProbe.createProbeResponse(current);

	var mid_name = probe_response.getParameter('agent') + '';
	if (mid_name.indexOf('mid.server.') == 0)
		mid_name = mid_name.substring(11);

	var mid_gr = new GlideRecord('ecc_agent');
	mid_gr.addQuery('name', mid_name);
	mid_gr.query();
	if (!mid_gr.next()) {
		processError(null, current, 'Cannot find MID server by name: ' + mid_name, gs.now());
		return;
	}

	var mid_sysid = mid_gr.sys_id;
	if (probe_response.resultCode != 0) {
		processError(mid_sysid, current, probe_response.resultError, current.sys_created_on);
		return;
	}

	var cap_gr = new GlideRecord('ecc_agent_capability');
	cap_gr.addQuery('capability', 'Nmap');
	cap_gr.query();
	if (!cap_gr.next()) {
		processError(null, current, 'Cannot find MID server Capability Nmap ', gs.now());
		return;
	}
	var cap_sysid = cap_gr.sys_id;

	if (current.source == 'installNmap')
		processInstallResult(mid_gr, cap_sysid, probe_response);
	else if (current.source == 'uninstallNmap')
		processUninstallResult(mid_gr, cap_sysid);
	else
		return;

	current.state = 'processed';
	current.processed = new GlideDateTime();
	current.update();

	// resolve mid server issue if exists
	MIDServerUtil.resolveExistingIssues(mid_sysid, 'SystemCommand ' + current.source, null);
})(current, previous);

function processInstallResult(mid_gr, cap_sysid, probe_response) {
	// update Nmap version
	var nmap_version_regex = new SNC.Regex(/Nmap (.*) was installed successfully/);
	var match = nmap_version_regex.match(probe_response.output + '');
	if (match) {
		var nmap_version = match[1];
		mid_gr.nmap_version = nmap_version;
		mid_gr.update();
	}

	// insert m2m to assign Nmap capability to Mid server
	var gr = new GlideRecord('ecc_agent_capability_m2m');
	gr.addQuery('agent', mid_gr.sys_id);
	gr.addQuery('capability', cap_sysid);
	gr.query();
	if (!gr.next()) {
		gr.initialize();
		gr.agent = mid_gr.sys_id;
		gr.capability = cap_sysid;
		gr.insert();
	}
}

function processUninstallResult(mid_gr, cap_sysid) {
	// remove Nmap version
	mid_gr.nmap_version = 'NULL';
	mid_gr.update();

	// remove m2m to unassign Nmap capability from Mid server
	var gr = new GlideRecord('ecc_agent_capability_m2m');
	gr.addQuery('agent', mid_gr.sys_id);
	gr.addQuery('capability', cap_sysid);
	gr.query();
	if (gr.next())
		gr.deleteRecord();
}

function processError(mid_sysid, current_gr, error_message, time) {
	MIDServerUtil.createOrUpdateIssue(mid_sysid, 'SystemCommand ' + current_gr.source, error_message);

	current_gr.state = 'error';
	current_gr.error_string = error_message;
	current_gr.processed = new GlideDateTime();
	current_gr.update();
}
