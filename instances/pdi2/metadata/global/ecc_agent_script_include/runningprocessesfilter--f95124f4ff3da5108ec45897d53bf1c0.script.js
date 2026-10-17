var RunningProcessesFilter = Class.create();

RunningProcessesFilter.prototype = {
	/*
		processes is an array containing a normalized list of processes.
			each process has this structure:
				proc.pid = <pid>
				proc.ppid = <ppid>
				proc.name = <name>
				proc.parameters = <parameters>
				proc.command = <command>
		filterDefs is an array of object defining the filters. See
		Example:
			{
				isCaseSensitive: 1,
				orOps: [		// Only 1 item in this array needs to match. Called 'criteria' in the code
					[			// Every item in this array needs to match. Called 'predicate' in the code
						{
							field: 'name',
							op: 'STARTSWITH',
							value: 'linux',
							orOps: [	// Optional array of additional OR conditions
								{ field: 'name', op: 'STARTSWITH', value: 'windows' }
							]
						}
					]
				]
			}
	*/
	// !!! Important !!!
	// This code is surprisingly time consuming so it's heavily optimized. Don't make changes without
	// testing performance. We've seen systems with more than 5,000 running processes and smart content
	// has over 500 filters.
	filterResults: function(processes, filterDefs) {

		if (!filterDefs || !(filterDefs instanceof Array) || filterDefs.length < 1)
			return processes;

		// Regexes need to be cached separately for case sensitive vs. insensitive. The
		// flag passed to the RegExp constructor is either '' or 'i' so I'm using those
		// values as keys here.
		RunningProcessesFilter.regexCache = { '': { }, 'i': { } };

		// Filters every process that matches at least 1 filter definition.
		return processes.filter(function(proc) {
			// Convert to numeric values
			// 'pid' and 'ppid' are integers in the DB, so if either has a string value it won't get
			// written to the DB. This means it's OK for this conversion to mangle non-numeric string
			// values. Strings are going to get converted to NaN by this code, which is helpful in
			// this case. NaN isn't equal to, greater than or less than any number so any of those
			// filters won't match (which is what we want.)
			proc.pid = +proc.pid;
			proc.ppid = +proc.ppid;

			// Create a new object with proc as the prototype. This way I can freely write to the
			// new object without changing the object that's going to be returned to the instance.
			// I want to write to the object because I want to convert strings to lowercase only
			// once (to squeeze every possible bit of performance out of this code.)
			proc = Object.create(proc);

			return filterDefs.every(function(filterDef) { return !matchesFilter(filterDef, proc); });
		});
	},

	type: 'RunningProcessesFilter'
};

function matchesFilter(filterDef, proc) {
	return checkOrList(filterDef);

	function checkOrList(predicate, caseInsensitive) {
		if (predicate.hasOwnProperty('isCaseSensitive'))
			caseInsensitive = predicate.isCaseSensitive == '1' ? '' : 'i';
		if (predicate.op && conditionMatches(predicate, proc, caseInsensitive))
			return true;
		if (predicate.orOps)
			return predicate.orOps.some(checkAndList);

		function checkAndList(predicate) {
			if (!(predicate instanceof Array))
				return conditionMatches(predicate, proc, caseInsensitive);
			return predicate.every(function(predicate) { return checkOrList(predicate, caseInsensitive); });
		}
	}
}

function conditionMatches(operation, proc, caseInsensitive) {
	var op = operation.op,
		field = operation.field,		// The field we're going to fetch from 'proc'
		filterValue = operation.value,
		// 'proc' may have normalized values from previous filters. For a case-insensitive comparison
		// we need to use the original value, which we can grab from proc.__proto__.
		procValue = caseInsensitive ? proc[field] : proc.__proto__[field];

	// filterValue can be undefined or empty (for example isEmpty condition) - so we are not validating filterValue here.
	if (!op || !field)
		return true;

	switch (op) {
		case 'ANYTHING':
			return true;

		case 'ISEMPTY':
		case 'ISNOTEMPTY':
		case 'EMPTYSTRING':
			if (procValue)
				return op == 'ISNOTEMPTY';
			return op == 'ISEMPTY' || op == 'EMPTYSTRING';

		case 'MATCH_RGX':
		case 'LIKE':
		case 'NOT LIKE':
			if (!RunningProcessesFilter.regexCache[caseInsensitive][filterValue])
				RunningProcessesFilter.regexCache[caseInsensitive][filterValue] = new RegExp(filterValue, caseInsensitive);

			var rx = RunningProcessesFilter.regexCache[caseInsensitive][filterValue];
			// proc.__proto__ is used below to get the non-normalized value. It's possible a normalized value
			// exists from a different filter and we don't want to use it in the regex.
			if (op == 'NOT LIKE')
				return !rx.test(proc.__proto__[field]);
			return rx.test(proc.__proto__[field]);
	}

	if (field != 'pid' && field != 'ppid') {
		procValue = procValue || '';
		if (caseInsensitive) {
			if (!proc.hasOwnProperty(field))
				proc[field] = procValue.toLowerCase();
			procValue = proc[field];
		}
	}

	// In testing using a switch was ~10% faster than using a series of "if (op == ...)" statements.
	switch (op) {
		case '=':
			return procValue == filterValue;

		case '!=':
			return procValue != filterValue;

		case 'CONTAINS':
			return (procValue.indexOf(filterValue) > -1);

		case 'STARTSWITH':
			return procValue.startsWith(filterValue);

		case 'ENDSWITH':
			return procValue.endsWith(filterValue);

		case 'DOES NOT CONTAIN':
			return (procValue.indexOf(filterValue) < 0);

		case 'IN':
			// Convert the filter values to an object. It was created as an array
			// because that's easier for the Java code and the Java code is the
			// primary code path.
			if (filterValue instanceof Array) {
				operation.value = { };
				filterValue.forEach(function(name) { operation.value[name] = 1; } );
				filterValue = operation.value;
			}
			return filterValue.hasOwnProperty(procValue);

		case 'BETWEEN':
			if (procValue < filterValue[0])
				return false;

			return (filterValue.length == 1 || (procValue <= filterValue[1]));

		case '>':
			return procValue > filterValue;

		case '<':
			return procValue < filterValue;

		case '>=':
			return procValue >= filterValue;

		case '<=':
			return procValue <= filterValue;
	}

	var secondProcValue = proc[filterValue];
	if (caseInsensitive && filterValue != 'pid' && filterValue != 'ppid' && secondProcValue) {
		if (!proc.hasOwnProperty(filterValue))
			proc[filterValue] = secondProcValue.toLowerCase();
		secondProcValue = proc[filterValue];
	}

	switch (op) {
		case 'SAMEAS':
		case 'NSAMEAS':
			if (procValue == secondProcValue)
				return op == 'SAMEAS';
			return op == 'NSAMEAS';

		case 'GT_FIELD':
			return procValue > secondProcValue;

		case 'LT_FIELD':
			return procValue < secondProcValue;

		case 'GT_OR_EQUALS_FIELD':
			return procValue >= secondProcValue;

		case 'LT_OR_EQUALS_FIELD':
			return procValue <= secondProcValue;
	}

	return false;
}
