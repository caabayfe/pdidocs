(function() {

	if (current.topic == 'Shazzam') {
		gs.addInfoMessage(gs.getMessage('Rerunning Shazzam Not Available'));
		action.setRedirectURL('discovery_status.do?sys_id=' + current.agent_correlator);
		return;
	}

	var g_doc, sa, saGr, job,
		nodesToUpdate = { ci_sys_id: 1, cmdb_ci: 1, agent_correlator: 1 },
		XMLUtil = GlideXMLUtil,
		payload = current.payload,
		parameters = { };

	try {
		action.setRedirectURL(current);

		if (payload == '<see_attachment/>') {
			saGr = new GlideRecord('sys_attachment');
			saGr.addQuery('table_sys_id', current.getUniqueValue());
			saGr.addQuery('table_name', current.getTableName());
			saGr.addQuery('file_name', 'payload.txt');
			saGr.query();
			if (saGr.next()) {
				sa = new GlideSysAttachment(saGr.sys_id);
				payload = String(Packages.java.lang.String(sa.getBytes(saGr)));
			}
		}

		// See if we need to create a Ci, status and device history
		checkAndFixCi();

		current.state = 'ready';
		current.processed = '';
		current.error_string = '';
		if (current.queue == 'output') {
			current.created = '';
			current.sequence = '';
			current.insert();
			action.setRedirectURL(current);
		} else {
			job = new DiscoverySensorJob();
			job.process();
		}

	} catch (e) {
		gs.addInfoMessage(gs.getMessage('Failed to rerun: {0}', e.toString()));
	}

	function checkAndFixCi() {
		var ciGr, statusGr, newStatus;

		g_doc = XMLUtil.parse(payload);
		getParameters();

		ciGr = getCiRecord();
		if (!ciGr)
			return;

		// Create a new discovery_status
		statusGr = new GlideRecord('discovery_status');
		if (!statusGr.get(parameters.agent_correlator)) {
			statusGr = new GlideRecord('discovery_status');
			statusGr.description = 'Created by Run Again (Debug)';
			statusGr.state = 'Active';
			statusGr.started = 1;
			statusGr.completed = 0;
			statusGr.discover = 'Debugging';
			statusGr.source = current.source;
			statusGr.insert();
			newStatus = true;
		}

		agent_correlator = statusGr.sys_id + '';

		// We need to rewrite the ECC queue record using the new device's sys_id...
		nodesToUpdate.ci_sys_id && nodesToUpdate.ci_sys_id.setAttribute('value', ciGr.sys_id);
		nodesToUpdate.cmdb_ci && nodesToUpdate.cmdb_ci.setAttribute('value', ciGr.sys_id);
		// ...and (maybe) its new agent_correlator
		if (newStatus) {
			nodesToUpdate.agent_correlator && nodesToUpdate.agent_correlator.setAttribute('value', agent_correlator);
			current.agent_correlator = agent_correlator;
		}

		// If it's not an attachment then set the new payload (with an updated cmdb_ci/ci_sys_id)
		if (!sa)
			current.payload = GlideXMLUtil.toString(g_doc);

		// Insert a new record.  This is only necessary to get it to show up on the discovery_status
		// (ECC queue records are filtered by creation date in the related list)
		if (newStatus)
			current.insert();
		else
			current.update();

		action.setRedirectURL(current);

		// If the payload is in an attachment then create a new one for the new record
		if (sa)
			sa.write(current, 'payload', GlideXMLUtil.toString(g_doc));

		// Create the device history.  createDeviceHistory() depends on global variables 'source'
		// and 'agent_correlator' (set above)
		source = '' + current.source;

		g_device = SncDeviceHistory.createDeviceHistory(source, ciGr, agent_correlator);
		g_device.setCISysID(ciGr.sys_id);
	}

	function getCiRecord() {
		var gr,
			tableName = 'cmdb_ci_computer',
			sysId = parameters.ci_sys_id || parameters.cmdb_ci;

		// Check for an existing device record
		gr = new GlideRecord('cmdb_ci');
		if (gr.get(sysId))
			return;

		// If we don't have one then create it.
		// We have to figure out what type of record to create.
		tableName = getTableName(parameters.probe) || 'cmdb_ci';

		gr = new GlideRecord(tableName);
		gr.name = 'Created By Run Again (Debug)';
		gr.ip = '' + current.source;
		gr.insert();

		return gr;
	}

	// Read the parameters from the payload
	function getParameters() {
		var nodeList, element, i, name, value,
			parent = g_doc.getDocumentElement(),
			topTagName = parent.getTagName();

		nodeList = parent.getElementsByTagName('parameter');

		for (i = 0; i < nodeList.getLength(); i++) {
			element = nodeList.item(i);
			name = '' + element.getAttribute('name');
			value = '' + element.getAttribute('value');

			if (name in nodesToUpdate)
				nodesToUpdate[name] = element;

			parameters[name] = value;
		}
	}

	// Map of probe name substring to table
	var tablesByProbeName = {
		vcenter: 'cmdb_ci_vcenter',
		windows: 'cmdb_ci_win_server',
		solaris: 'cmdb_ci_solaris_server',
		snmp: 'cmdb_ci_ip_switch',
		ssh: 'cmdb_ci_linux_server',
		unix: 'cmdb_ci_linux_server',
		smi: 'cmdb_ci_storage_server',
		aix: 'cmdb_ci_aix_server',
		linux: 'cmdb_ci_linux_server',
		'mac os x': 'cmdb_ci_mac_server',
		netscaler: 'cmdb_ci_lb',
		'switch': 'cmdb_ci_ip _switch',
		zos: 'cmdb_ci_zos'
	};

	// I considered using other things to try to figure out the correct table for
	// the generated CI.  Other things I considered: probe.topic, parameter "os_type",
	// port number
	function getTableName(probe, name) {
		var gr, pnss;   // "pnss" is "probe name substring"

		// If this probe gets triggered by a classifier probe then use
		// the table from the classifier
		gr = new GlideRecord('discovery_classifier_probe');
		gr.addQuery('child', probe);
		gr.query();
		if (gr.next() && gr.classy.table)
			return gr.classy.table;

		// See if we can figure out what triggered us and try to
		// use that to get the table
		gr = new GlideRecord('discovery_sensor_probe');
		gr.addQuery('child', probe);
		gr.query();
		if (gr.next() && gr.parent && gr.parent.reacts_to_probe) {
			table = getTableName(gr.parent.reacts_to_probe, gr.parent.reacts_to_probe.name);
			if (table)
				return table;
		}

		// Last try: make a guess based on the name of the probe
		name = (name || '').toLowerCase();
		for (pnss in tablesByProbeName) {
			if (name.indexOf(pnss) > -1)
				return tablesByProbeName[pnss];
		}
	}
})();
