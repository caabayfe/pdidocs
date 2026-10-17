var GetDiscoverySchedulerConfigPerProbe = Class.create();
GetDiscoverySchedulerConfigPerProbe.prototype = {
	initialize: function() {},

	exclusionList: ['description', 'probe', 'name', 'active'],
	CACHE_NAME: 'running_process_filter_cache',

	getConfig: function(probe, agentCorrelator) {
		var dSchedulerSysId = this.getDiscoverySchedulerFromAgentCorrelator(agentCorrelator);

		return this.getConfigFromCache(probe, dSchedulerSysId);
	},

	getDiscoverySchedulerFromAgentCorrelator: function(agentCorrelator) {
		if (!agentCorrelator)
			return undefined;

		var dStatusGr = new GlideRecord('discovery_status');
		if (dStatusGr.get('sys_id', agentCorrelator))
			return dStatusGr.dscheduler;
	},

	getConfigFromCache: function(probe, dSchedulerSysId) {
		var filters = sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, probe);
		if (!filters) {
			// If there was no cache then get the config from the database and cache it.
			// We do NOT want to cahce per discovery schedule, we cache all configuration and filter in memory.
			filters = this.getConfigFromDatabase(probe);
			sn_scoped_cache.ScopedCacheManager.put(this.CACHE_NAME, probe, JSON.stringify(filters));
		}

		// Make sure filters is an object.
		if (typeof filters == 'string')
			filters = JSON.parse(filters);

		// Now filter the results based on discovery scheduled sys id.
		filters = filters.filter(function(filterDef) {
			return (!filterDef.discovery_schedule || filterDef.discovery_schedule == dSchedulerSysId);
		});

		return JSON.stringify(filters);
	},

	getConfigFromDatabase: function(probe) {
		// Get all config per this probe, regardless of discovery schedule
		var filtersGr = new GlideRecord('running_process_filter');
		filtersGr.addActiveQuery();
		filtersGr.addQuery('probe', probe);
		filtersGr.query();
		var filters = [ ];
		var sensitive = { };
		var insensitive = { };
		var compoundSensitive = { fields: { }, filters: [ ] };
		var compoundInsensitive = { fields: { }, filters: [ ] };

		while (filtersGr.next()) {
			var csv = filtersGr.getValue('is_case_sensitive_value') + '';
			var filter = this.getQueriesAsJS(filtersGr.getValue('filter'), csv);
			var ds = filtersGr.getValue('discovery_schedule');
			if (ds)
				filter.discovery_schedule = ds;

			if (!simplify(filter, csv ? sensitive : insensitive)) {
				if (!checkCompound(filter, csv ? compoundSensitive : compoundInsensitive))
					filters.push(filter);
			}
		}

		getFilter(sensitive, 1);
		getFilter(insensitive, 0);
		getCompoundFilter(compoundSensitive, 1);
		getCompoundFilter(compoundInsensitive, 0);

		return filters;

		// Create a single 'IN' filter for all equality comparisons
		function getFilter(simple, insensitive) {
			var filter,
				keys = Object.keys(simple);

			if (!keys.length)
				return;

			filter = { isCaseSensitive: insensitive, orOps: [ ] };
			keys.forEach(function(key) { filter.orOps.push([ { field: key, op: 'IN', value: mapValues(simple[key], insensitive) } ] ); });
			filters.push(filter);
		}

		// When a filter contains an equality comparison along with other AND conditions we have to maintain the structure. The equality condition
		// will almost never be true, though, so it makes sense to short-circuit the check. This merges all compound conditions into a single AND
		// condition. The condition will look like:
		// <field_1> IN <list_1>  OR  <field_2> IN <list_2>  OR  ...
		//     AND
		// <filter_1> OR <filter_2> OR ...
		// I.e. if any equality used in any compound condition is true then check all compound conditions.
		function getCompoundFilter(compound, insensitive) {
			var filter,
				keys = Object.keys(compound.fields);

			if (!compound.filters.length)
				return;

			filter = { isCaseSensitive: insensitive, orOps: [ [ { orOps: [ ] }, { orOps: compound.filters } ] ] };
			keys.forEach(function(key) { filter.orOps[0][0].orOps.push( { field: key, op: 'IN', value: mapValues(compound.fields[key], insensitive) } ); });
			filters.push(filter);
		}

		function mapValues(values, insensitive) {
			if (insensitive)
				return values.map(function(value) { return value.toLowerCase(); });
			return values;

		}

		function checkCompound(filter, target) {
			var isCompound;

			filter.orOps.forEach(function(op) {
				op.forEach(function(op2) {
					if (op2.orOps)
						op2.orOps.forEach(checkEquality);
					checkEquality(op2);
				});
			});
			if (isCompound)
				target.filters = target.filters.concat(filter.orOps);

			return isCompound;

			function checkEquality(filter) {
				if (filter.op == '=') {
					target.fields[filter.field] = target.fields[filter.field] || [ ];
					target.fields[filter.field].push(filter.value);
					isCompound = true;
				}
			}
		}

		// Check to see if this is a single equality comparison.
		// We're going to merge all equality comparisons into a single 'IN' filter.
		function simplify(filter, target) {
			if (filter.orOps.length == 1 && filter.orOps[0].length == 1 && filter.orOps[0][0].op == '=') {
				var op = filter.orOps[0][0];
				if (!target.hasOwnProperty(op.field))
					target[op.field] = [ ];
				target[op.field].push(op.value);
				return true;
			}
		}
	},

	getQueriesAsJS: function(filter, isCaseSensitive) {
		var qs = new GlideQueryString('cmdb_running_process', filter);

		// Will populate the terms
		qs.deserialize();
		var terms = qs.getTerms();

		/* Creating an object like:
		{
			isCaseSensitive: 1,
			orOps: [		// Only 1 item in this array needs to match
				[	// Every item in each element of orOps has to match
					{ field: 'name', op: 'STARTSWITH', value: '1st condition' },
					{ field: 'name', op: '=', value: '2nd condition',
						orOps: [		// Outer condition or any of these needs to match
							{ field: 'name', op: '=', value: 'OR of 2nd condition' },
							{ field: 'name', op: '=', value: '2nd OR of 2nd condition' }
						]
					},
					{ field: 'name', op: '=', value: '3rd condition' }
				],
				[
					{ field: 'name', op: '=', value: '2nd criteria' }
				]
			]
		}
		*/
		var op, subQuery,
		query = [  ],
		qJs = { isCaseSensitive: isCaseSensitive, orOps: [ query ] };

		for (var i = 0; i < terms.size(); i++) {
			var term = terms.get(i);

			if (term.isNewQuery()) {		// Called a 'New Criteria' in the UI
				query = [ ];
				qJs.orOps.push(query);
			}

			op = {
				field: term.getField(),
				op: term.getOperator(),
				value: term.getValue()
			};
			if (!op.field)
				continue;

			normalizeOp(op, 'value');

			if (term.isOR()) {
				subQuery = subQuery || [ ];	// Only possible if first term is an 'OR', which shouldn't happen.
				subQuery.orOps = subQuery.orOps || [ ];
				subQuery.orOps.push(op);
			} else {
				subQuery = op;
				query.push(op);
			}
		}

		return qJs;

		function normalizeOp(op, name, valueOnly) {
			if (typeof op[name] == 'string') {
				op[name] = (op[name] + '').trim();
				if (isCaseSensitive && op.op != 'MATCH_RGX' && op.op != 'LIKE' && op.op != 'NOT LIKE')
					op[name] = op[name].toLowerCase();
			}
			if (op[name] == +op[name])
				op[name] = +op[name];
			if (valueOnly)
				return;
			if (op.op == 'LIKE' || op.op == 'NOT LIKE')
				op[name] = op[name].replace('%', '.*').replace('_', '.');
			else if (op.op == 'BETWEEN') {
				op[name] = op[name].split('@');
				normalizeAll(op[name]);
			} else if (op.op == 'IN') {
				op[name] = op[name].split(',');
				normalizeAll(op[name]);
			}

			function normalizeAll(arr) {
				for (var i = 0; i < arr.length; i++)
					normalizeOp(arr, i, true);
			}
		}
	},
	type: 'GetDiscoverySchedulerConfigPerProbe'
};
