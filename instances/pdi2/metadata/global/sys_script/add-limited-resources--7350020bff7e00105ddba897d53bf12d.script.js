(function(current) {
	var name, eccPayload, probeParms, topics,
		tables = [  { table: 'ecc_agent_property' },
				  { table: 'ecc_agent_config', nameField: 'param_name' },
				  { table: 'sys_properties', skipAgent: true }
				 ],
		agent_name = ('' + current.agent).substr(11),     // substr(11) to remove "mid.server."
		valueRegex = /^(.*?)({\s*((?:\w|\.)+)\s*})(.*)$/,
		resources = { },
		changed,
		enabled = SNC.MidServerUtil.getMidProperty('mid.probe.wait.resources', agent_name, 'true');

	if (enabled !== undefined && enabled != 'true')
		return;

	eccPayload = EccPayload(current);
	probeParms = eccPayload.getProbeParameters();
	if (!probeParms)
		return;

	topics = eccPayload.getProbeTopics();

	// In case someone is re-running probes to test resource usage
	for (name in probeParms[0]) {
		if (name.startsWith('limited.resource.')) {
			changed = true;
			delete probeParms[0][name];
		}
	}

	// Consolidate resource use for all probes of a multiprobe
	// This isn't ideal but it's difficult to reserve resources for
	// each sub-probe individually.  It's also not clear what to do
	// with resources for the multiprobe itself.  The logical thing
	// to do would be to reserve those resources for all sub-probes
	// but this seems likely to cause unexpected problems, e.g. the
	// user says both the multiprobe and each of its subprobes need
	// powershell, resulting in reservation of 2 resources instead
	// of 1.
	probeParms.forEach(getResourceUsage);

	for (name in resources)
		if (resources[name]) {
			changed = true;
			probeParms[0]['limited.resource.' + name] = '' + resources[name];
		}

	if (changed)
		eccPayload.updatePayload();

	function getResourceUsage(parms, idx) {
		var limitedGr = new GlideRecord('mid_limited_resource');

		limitedGr.addQuery('active', true);
		limitedGr.orderBy('order');
		limitedGr.query();
		while (limitedGr.next()) {
			if (!checkApplies(limitedGr, parms, idx))
				continue;
			addResource(limitedGr);
		}
	}

	function checkApplies(limitedGr, parms, idx) {
		if (applies('mid_limited_resource_topic', topics[idx], 'topic', limitedGr.invert_topic))
			return true;

		if (parms.pattern)
			return applies('mid_limited_resource_pattern_m2m', parms.patternId, 'pattern', limitedGr.invert_pattern_list);

		if (parms.probe)
			return applies('mid_limited_resource_probe_m2m', parms.probe, 'probe', limitedGr.invert_probe_list);

		function applies(table, value, column, invert) {
			var m2mGr = new GlideRecord(table);
			m2mGr.addQuery('resource', limitedGr.sys_id);
			m2mGr.addQuery('active', true);
			if (invert)
				m2mGr.addQuery(column, '!=', value);
			else
				m2mGr.addQuery(column, value);
			m2mGr.query();

			return m2mGr.getRowCount();
		}
	}

	function addResource(limitedGr) {
		var gr, type, name, value;

		type = limitedGr.sys_class_name + '';
		name = limitedGr.name + '';
		name = name.toLowerCase();

		gr = new GlideRecord(type);
		if (!gr.get('sys_id', limitedGr.sys_id))
			return;

		if (type == 'mid_limited_resource_value')
			value = +gr.value;
		else if (type == 'mid_limited_resource_script')
			value = expand(myEval(gr.script + ''));
		else
			value = expand(gr.expanding + '');

		if (!resources[name] || (resources[name] < value))
			resources[name] = value;
	}

	function expand(expr) {
		var parts, value, match,
			ifTrue = expr,
			ifFalse = '0';

		parts = expr.split(':');
		if (parts.length > 1) {
			ifTrue = parts.pop();
			expr = parts.join(':');
			parts = expr.split('?');
			if (parts.length > 1) {
				ifFalse = ifTrue;
				ifTrue = parts.pop();
				expr = parts.join('?');
			}
		}

		expr = expr + ' ? ' + ifTrue + ' : ' + ifFalse;

		parts = [ ];
		while ((match = valueRegex.exec(expr)) != null) {
			value = getSystemProperty(match[3]);
			if (value !== undefined)
				parts.push(match[1] + value);
			else
				parts.push(match[1] + '0');
			expr = match[4];
		}
		parts.push(expr);
		expr = parts.join('');

		return +myEval(expr) || 0;

		function replace(name, value, expr) {
			var parts = expr.split(name);
			return parts.join(value);
		}
	}

	function getSystemProperty(name) {
		var value;
		if (tables.some(getProp))
			return value;

		function getProp(tableInfo) {
			var qc,
				gr = new GlideRecord(tableInfo.table);

			gr.addQuery(tableInfo.nameField || 'name', name);
			if (!tableInfo.skipAgent) {
				gr.orderByDesc('ecc_agent');   // If there is a MID-specific setting we'll get it first
				qc = gr.addNullQuery('ecc_agent');
				qc.addOrCondition('ecc_agent.name', agent_name);
			}
			gr.query();
			if (gr.next()) {
				value = '' + gr.value;
				return true;
			}
		}
	}
})(current);

function myEval(script) {
	try {
		return eval(script);
	} catch (e) {
		DiscoveryLogger.warn('Execption in limited resource script: ' + e.toString(), 'Add Limited Resource', current.sys_id);
		return 1;
	}
}
