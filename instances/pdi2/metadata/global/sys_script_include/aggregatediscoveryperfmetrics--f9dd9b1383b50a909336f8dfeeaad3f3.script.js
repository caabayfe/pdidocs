AggregateDiscoveryPerfMetrics = {
	rollup: function (status, byTarget) {
		var cutoff, oldCutoff, rollup, probe, prevProbe, name, prevName, ip, prevIp, rollupName, ga, number, schedule,
			target = 'discovery_perf_metric_probe_sensor_rollup_by_build',
			multipageRegex = /(.*?)(?: - MultiPage \d+ of \d+)/i,
			orchestratorPageRegex = /(.*?)(?: - Orchestrator Page \d+)/i,
			nodesRegex = /(.*?)(?: \(nodes: \d+\))/i,
			values = { },
			columns = [ 'build_version', 'probe', 'ecc_queue_topic' ],
			types = [ 'SUM', 'COUNT', 'STDDEV' ],
			prefixes = [ 'probe_time', 'sensor_time', 'ire_time', 'pre_sensor_time', 'post_sensor_time' ],
			rotations = [ ];

		rotation = new GlideRecord('sys_table_rotation_schedule');
		rotation.addQuery('offline', false);
		rotation.addQuery('name.name', 'discovery_perf_metric_probe_sensor');
		rotation.addQuery('table_name', '!=', 'discovery_perf_metric_probe_sensor');
		rotation.query();
		while (rotation.next())
			rotations.push(rotation.table_name + '');

		if (status) {
			number = status.number;
			schedule = status.dscheduler && status.dscheduler.name;
			columns.push('discovery_status');
			if (byTarget)
				columns.push('target_ip_address');
		}
		columns.push('ecc_queue_name');

		cutoff = new GlideDateTime();
		cutoff.add(-1000*60);
		getAndUpdateOldCutoff(cutoff);

		rotations.forEach(function(table_name) {
			ga = new GlideAggregate(table_name);

			if (status) {
				target = 'discovery_perf_metric_probe_sensor_rollup_by_status';
				ga.addQuery('discovery_status', status.sys_id || status);

				if (byTarget)
					target = 'discovery_perf_metric_probe_sensor_rollup_by_target';
			} else {
				ga.addQuery('discovery_status', 'NOT LIKE', 'rba.%');
				ga.addNotNullQuery('discovery_status');
				ga.addQuery('sys_created_on', '<=', cutoff);
				if (oldCutoff)
					ga.addQuery('sys_created_on', '>', oldCutoff);
			}

			columns.forEach(function(by) { ga.groupBy(by); });
			ga.orderBy('ecc_queue_name');

			prefixes.forEach(function(column) {
				types.forEach(function(type) {
					ga.addAggregate(type, column);
				});
			});

			ga.setOrderByFollowRef(false);
			ga.setGroupByFollowRef(false);
			ga.query();

			while (ga.next()) {
				columns.forEach(function(column) { values[column] = ga[column] + ''; });
				probe = ga.probe + '';
				fullName = ga.ecc_queue_name + '';
				match = multipageRegex.exec(fullName);
				name = match ? match[1] : fullName;					// 'name' has "- MultiPage x of y" stripped out.
				if (byTarget)
					ip = ga.target_ip_address + '';

				// Probes get rolled up by probe, except Shazzam (sys_id eb95df760ab301550015543188996362). Shazzam gets rolled up by name.
				// Patterns (sys_id 4f64c6389f230200fe2ab0aec32e7068) get rolled up by ecc_queue_name after stripping out multipage & orchestrator page parts.
				if (probe != prevProbe || ((probe == '4f64c6389f230200fe2ab0aec32e7068' || probe == 'eb95df760ab301550015543188996362') && name != prevName) || ip != prevIp) {
					prevProbe = probe;
					prevName = name;
					prevIp = ip;
					rollup && rollup.update();
					rollup = new GlideRecord(target);

					columns.forEach(function(column) { if (column != 'ecc_queue_name' && column != 'discovery_status') rollup.addQuery(column, values[column]); });
					if (status && !byTarget)
						rollup.addQuery('discovery_status', values.discovery_status);

					rollup.addQuery('probe', probe);
					rollupName = fullName;
					if (probe == '4f64c6389f230200fe2ab0aec32e7068') {
						// Strip out " - Orchestrator Page x"
						// We're going to get and update the same rollup record for each orchestrator page.
						// This could be more efficient but I couldn't see how to write efficient code that
						// handled orchestrator inputs that are themselves multipage that was also not
						// horribly complex.
						match = orchestratorPageRegex.exec(name);
						rollupName = match ? match[1] : name;

						rollup.addQuery('ecc_queue_name', rollupName);
					} else if (probe == 'eb95df760ab301550015543188996362')
						rollup.addQuery('ecc_queue_name', rollupName);

					rollup.query();

					if (!rollup.next()) {
						columns.forEach(function(column) { rollup[column] = values[column]; });
						rollup.ecc_queue_name = rollupName;
						if (status && !byTarget) {
								rollup.status_number = number;
								rollup.schedule_name = schedule;
						}

						prefixes.forEach(function(prefix) {
							if (+ga.getAggregate('SUM', prefix)) {
								rollup[prefix + '_total'] = 0;
								rollup[prefix + '_count'] = 0;
								rollup[prefix + '_stddev'] = 0;
							}
						});
					}
				}

				if (probe != '4f64c6389f230200fe2ab0aec32e7068' && probe != 'eb95df760ab301550015543188996362') {
					rollupName = findLongestPrefix(fullName, rollupName);
					rollup.ecc_queue_name = rollupName;
				}

				prefixes.forEach(mergeTime);
			}
			rollup && rollup.update();

			function findLongestPrefix(s1, s2) {
				var i = 0,
					match = nodesRegex.exec(s1);

				if (match)
					s1 = match[1];

				while (s1[i] && (s2[i] == s1[i]))
					i++;

				return s1.substr(0, i);
			}

			function mergeTime(base) {
				if (base == 'probe_time' && fullName.includes('- MultiPage') && !fullName.includes('- MultiPage 1 of'))
					return;

				var sum = +ga.getAggregate('SUM', base),
					count = +ga.getAggregate('COUNT', base),
					stdDev = +ga.getAggregate('STDDEV', base),
					oldCount = +rollup[base + '_count'],
					oldStdDev = +rollup[base + '_stddev'],
					newCount = count + oldCount;

				if (sum) {
					rollup[base + '_total'] = +rollup[base + '_total'] + sum;
					rollup[base + '_count'] = newCount;
					rollup[base + '_average'] = +rollup[base + '_total'] / newCount;
					rollup[base + '_stddev'] = Math.sqrt((oldStdDev * oldStdDev * oldCount + stdDev * stdDev * count) / newCount);
				}
			}
		});
		function getAndUpdateOldCutoff(newCutoff) {
			var gr2,
				gr = new GlideRecord('discovery_private_properties');

			if (gr.get('name', 'perf_metric_rollup_by_build_cutoff'))
				oldCutoff = new GlideDateTime(gr.value);
			else {
				gr2 = new GlideRecord(target);
				gr2.setLimit(1);
				gr2.query();
				if (gr2.next())
					oldCutoff = new GlideDateTime(gr2.aggregation_cutoff);
			}

			gr.name = 'perf_metric_rollup_by_build_cutoff';
			gr.value = newCutoff;
			gr.update();
		}
	}
};
