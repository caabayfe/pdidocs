function GlideQueryEvaluator() { }

GlideQueryEvaluator.aggregateQueries = {
	avg: true,
	count: true,
	max: true,
	min: true,
	sum: true,
};

GlideQueryEvaluator.recordUsage = function (glideQuery, tableScope, operation) {
	if (tableScope === 'global' && glideQuery.scope && glideQuery.scope !== 'rhino.global' && !Schema.hasAccess(glideQuery.table, operation)) {
		var sampleMap = new GCFSampleMap();
		sampleMap.put('calling_scope', glideQuery.scope);
		sampleMap.put('operation', operation);
		sampleMap.put('table', glideQuery.table);

		GCFCollector.recordUsageEvent('glidequery', 'usage', 'glidequery_unauthorized_global_access', sampleMap);
	}
};

GlideQueryEvaluator.createGlideRecord = function createGlideRecord(glideQuery, aggregate) {
	var useGlobalApi = (
			glideQuery.scope === 'rhino.global' ||
			typeof ScopedGlideRecord === 'undefined' ||
			(glideQuery.scope && gs.getProperty('glide.glidequery.limited_scopes', '')
				.toLowerCase()
				.split(',')
				.every(function (scope) { return scope !== glideQuery.scope; })))
		&& Object.getPrototypeOf(glideQuery) === global.GlideQuery.prototype;

	var useDataFilters = glideQuery.plan.some(function (step) { return step.type === 'withSecurityDataFilters'; });

	if (aggregate) {
		var glideAggregate = useGlobalApi
			? new GlideAggregate(glideQuery.table)
			: new ScopedGlideAggregate(glideQuery.table);

		if (useDataFilters)
			glideAggregate.enableSecurityFeature('data_filter');

		return glideAggregate;
	}

	var useGlideRecordSecure = glideQuery.plan.some(function (step) { return step.type === 'withAcls'; });

	if (useGlobalApi) {
		var glideRecord = useGlideRecordSecure
			? new GlideRecordSecure(glideQuery.table)
			: new GlideRecord(glideQuery.table);

		if (useDataFilters)
			glideRecord.enableSecurityFeature('data_filter');

		return glideRecord;
	}

	var scopedGlideRecord = useGlideRecordSecure
		? new ScopedGlideRecordSecure(glideQuery.table)
		: new ScopedGlideRecord(glideQuery.table);

	if (useDataFilters)
			scopedGlideRecord.enableSecurityFeature('data_filter');

	return scopedGlideRecord;
};

GlideQueryEvaluator.getPrimaryKeysFromSchema = function getPrimaryKeysFromSchema(table, schema) {
	var primaryKeys = {};
	var tableSchema = schema[table];
	for (var field in tableSchema) {
		if (tableSchema[field].primary) {
			primaryKeys[field] = true;
		}
	}
	return primaryKeys;
};

GlideQueryEvaluator.FieldComparisonOperators = {
	SAMEAS: true,
	NSAMEAS: true,
	GT_FIELD: true,
	LT_FIELD: true,
	GT_OR_EQUALS_FIELD: true,
	LT_OR_EQUALS_FIELD: true,
}

GlideQueryEvaluator.getSchemaForPlan = function (table, plan, extraFields) {
	var allFields = extraFields ? extraFields.concat() : [];

	for (var i = 0; i < plan.length; i++) {
		var step = plan[i];

		if (step.field) {
			allFields.push(step.field);
		}

		if (GlideQueryEvaluator.FieldComparisonOperators[step.operator]) {
			allFields.push(step.value);
		}
	}

	return Schema.of(table, allFields);
};

GlideQueryEvaluator.loadSchemaForTable = function loadSchemaForTable(glideQuery, additionalFields) {
	return glideQuery.plan
		.filter(function (step) { return step.query; })
		.map(function (step) { return step.query; })
		.map(function (query) { return GlideQueryEvaluator.getSchemaForPlan(query.table || glideQuery.table, query.plan); })
		.reduce(function (acc, schema) {
			for (var table in schema) {
				acc[table] = acc[table] || {};
				for (var field in schema[table]) {
					acc[table][field] = schema[table][field];
				}
			}
			return acc;
		}, GlideQueryEvaluator.getSchemaForPlan(glideQuery.table, glideQuery.plan, additionalFields));

}

GlideQueryEvaluator.escapeCarets = function (encodedQuery) {
	return (encodedQuery + '').replace(/\^+/g, function (match) { return match.length === 1 ? '^^' : match; });
};

GlideQueryEvaluator.encodeQuery = function encodeQuery(glideQuery) {
	return glideQuery.plan
		.filter(function (step) { return step.whereClause || step.type === 'orderBy' || step.type === 'orderByDesc'; })
		.map(function (step) {
			if (step.query) {
				return (step.type === 'orWhere' ? 'NQ' : '') + GlideQueryEvaluator.encodeQuery(step.query);
			}

			var or = step.type.startsWith('orWhere') ? 'OR' : '';

			switch (step.type) {
				case 'where':
				case 'orWhere':
					var value = step.value;

					if (JSUtil.instance_of(step.value, 'java.lang.String')) {
						value = GlideQueryEvaluator.escapeCarets(step.value);
						if (step.operator === 'ON') {
							value = GlideQueryEvaluator.encodeOnDateFilter(step.value);
						}
					} else if (step.operator === 'IN' || step.operator === 'NOT IN') {
						value = step.value
							.filter(function (v) { return v !== null })
							.map(function (v) { return GlideQueryEvaluator.escapeCarets(v); })
					} else if (step.operator === 'BETWEEN') {
						value = step.value
							.filter(function (v) { return v !== null })
							.map(function (v) { return GlideQueryEvaluator.escapeCarets(v); })
							.join('@');
					}

					return or + step.field + step.operator + value;
				case 'whereNull':
				case 'orWhereNull':
					return or + step.field + 'ISEMPTY';
				case 'whereNotNull':
				case 'orWhereNotNull':
					return or + step.field + 'ISNOTEMPTY';
				case 'orderBy':
					return or + 'ORDERBY' + step.field;
				case 'orderByDesc':
					return or + 'ORDERBYDESC' + step.field;
				default:
					NiceError.raise('Invalid where clause: ' + step.type);
			}

			return '';
		})
		.join('^');
};

GlideQueryEvaluator.executePlan = function executePlan(glideQuery, glideRecord, schema) {
	var context = {
		glideRecord: glideRecord,
		schema: schema,
		plan: glideQuery.plan,
	};

	glideQuery.plan.forEach(function (step) {
		if (step.action) {
			step.action(context);
		}
	});

	var encodedQuery = GlideQueryEvaluator.encodeQuery(glideQuery);
	glideRecord.addEncodedQuery(encodedQuery);
};

GlideQueryEvaluator.checkAggregatePlanHasGroupByAndMatchingAggregate = function checkAggregatePlanHasGroupByAndMatchingAggregate(plan, aggregate, field, name) {
	var groupByFound = false;
	var aggregateAndFieldMatch = false;

	plan.forEach(function (step) {
		if (step.type === 'groupBy') {
			groupByFound = true;
		}
		if (step.aggregate && step.type === aggregate && step.field === field) {
			aggregateAndFieldMatch = true;
		}
	});

	if (!groupByFound) {
		NiceError.raise(name + '() requires groupBy when used with aggregate()');
	}

	if (!aggregateAndFieldMatch) {
		NiceError.raise(name + '() called without matching aggregate and field. '
			+ "e.g. aggregate('" + aggregate + "', '" + field + "')'");
	}
};

GlideQueryEvaluator.checkIfAggregate = function checkIfAggregate(name, plan) {
	if (plan.some(function (step) { return step.aggregate; })) {
		NiceError.raise(name + ' cannot be used with aggregate()');
	}
};

GlideQueryEvaluator.stepTypesIncompatibleWithSimpleAggregates = {
	avg: true,
	min: true,
	max: true,
	sum: true,
	count: true,
	groupBy: true,
	having: true,
	limit: true,
	orderBy: true,
	orderByDesc: true,
};

GlideQueryEvaluator.callSimpleAggregate = function callSimpleAggregate(glideQuery, name, field) {
	if (!field && name !== 'count') {
		NiceError.raise("Aggregate function '" + name + "' expects a field name");
	}

	var incompatibleSteps = glideQuery.plan.filter(function (step) {
		return GlideQueryEvaluator.stepTypesIncompatibleWithSimpleAggregates[step.type];
	});
	if (incompatibleSteps.length > 0) {
		var illegalMethod = incompatibleSteps[0].aggregate ? 'aggregate' : incompatibleSteps[0].type;
		NiceError.raise('Terminal function ' + name + '() is incompatible with ' + illegalMethod + '()');
	}

	var requestedFields = field ? [field] : [];
	var schema = GlideQueryEvaluator.loadSchemaForTable(glideQuery, requestedFields);
	requestedFields
		.concat(Object.keys(GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema)))
		.forEach(function (f) { Schema.checkField(schema, glideQuery.table, f); });
	var glideAggregate = GlideQueryEvaluator.createGlideRecord(glideQuery, true);
	GlideQueryEvaluator.executePlan(glideQuery, glideAggregate, schema);
	glideAggregate.setGroup(false);

	if (name === 'avg' || name === 'sum') {
		Schema.checkSumOrAvgHasNumericType(schema, glideQuery.table, field, name);
	}

	GlideQueryEvaluator.recordUsage(glideQuery, glideAggregate.getTableScope(), 'read');
	glideAggregate.addAggregate(name, field);
	glideAggregate._query();
	glideAggregate._next();
	var value = glideAggregate.getAggregate(name, field);

	if (name === 'count') {
		return parseInt(value, 10);
	}

	var glideType = schema[glideQuery.table][field].type;

	return !value
		? Optional.empty("Unable to find matching rows for aggregation '"
			+ name + "' of field '" + field + "' using query:\n" + glideQuery)
		: Optional.of(
			Schema.isNumericField(glideType)
				? parseFloat(value)
				: GlideToJavaScriptMapper.getGlideToJsFn(glideType)(value)
		);
};

GlideQueryEvaluator.createQuerySession = function createQuerySession(glideQuery, fields, options) {
	var schema = GlideQueryEvaluator.loadSchemaForTable(glideQuery, fields);
	var requiredFields = fields.concat(
		Object.keys(GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema))
	);
	var isAggregate = glideQuery.plan.filter(function (step) {
		return GlideQueryEvaluator.aggregateQueries[step.type];
	}).length > 0;
	var glideRecord = GlideQueryEvaluator.executeSelectQuery(
		glideQuery,
		schema,
		requiredFields,
		GQ.merge({ aggregate: isAggregate }, options || {})
	);
	var groupedFields = glideQuery.plan
		.filter(function (step) { return step.type === 'groupBy'; })
		.map(function (step) { return step.field; });

	if (!isAggregate && groupedFields.length > 0) {
		NiceError.raise('groupBy expects a corresponding call to aggregate()');
	}

	return {
		glideRecord: glideRecord,
		schema: schema,
		fields: isAggregate ? groupedFields : requiredFields,
		isAggregate: isAggregate,
	};
};

GlideQueryEvaluator.selectOne = function selectOne(glideQuery, fields) {
	var session = GlideQueryEvaluator.createQuerySession(glideQuery, fields, { limit: 1 });

	if (!session.glideRecord.next()) {
		var reason = 'Unable to find a record with the following query:\n' + glideQuery;
		return Optional.empty(reason);
	}

	var nextJsRecord = GlideToJavaScriptMapper.createNextJsFn(glideQuery, session);

	return Optional.lazy(nextJsRecord);
};

GlideQueryEvaluator.createStream = function createStream(glideQuery, fields, options) {
	var session;
	var nextJsRecord;

	if (fields.length > 0 && glideQuery.plan.some(function (step) { return step.aggregate; })) {
		NiceError.raise('select does not take fields when used with aggregate()');
	}

	return new Stream(function () {
		if (!session) {
			session = GlideQueryEvaluator.createQuerySession(glideQuery, fields, options);
			nextJsRecord = GlideToJavaScriptMapper.createNextJsFn(glideQuery, session);
		}

		if (!session.glideRecord._next()) {
			return Stream.END;
		}

		return nextJsRecord();
	});
};

GlideQueryEvaluator.executeSelectQuery = function executeSelectQuery(glideQuery, schema, fields, options) {
	if (options.aggregate && glideQuery.plan.some(function (step) { return step.type === 'withAcls'; })) {
		NiceError.raise('Cannot use aggregate queries with withAcls()');
	}

	var glideRecord = GlideQueryEvaluator.createGlideRecord(glideQuery, options.aggregate);

	if (options.aggregate) {
		glideRecord.setGroup(glideQuery.plan.some(function (step) { return step.type === 'groupBy'; }));
	}

	fields.forEach(function (field) {
		Schema.checkField(schema, glideQuery.table, field);
	});

	GlideQueryEvaluator.executePlan(glideQuery, glideRecord, schema);

	if (options.limit) {
		glideRecord.setLimit(options.limit);
	}
	GlideQueryEvaluator.recordUsage(glideQuery, glideRecord.getTableScope(), 'read');
	glideRecord._query();
	return glideRecord;
};

GlideQueryEvaluator._getRawValue = function _getRawValue(glideQuery, key, schema, fields, primaryKeys) {
	if (!glideQuery.table) {
		NiceError.raise('Cannot get: no table given');
	}

	var gr = GlideQueryEvaluator.createGlideRecord(glideQuery);
	var queryFields = fields || [];
	queryFields.forEach(function (f) {
		Schema.checkField(schema, glideQuery.table, f);
	});

	GlideQueryEvaluator.recordUsage(glideQuery, gr.getTableScope(), 'read');

	return gr.get(key)
		? GlideToJavaScriptMapper.copyRecord(
			GlideToJavaScriptMapper.getRecordCopierFn(
				glideQuery.table,
				schema,
				Object.keys(primaryKeys).concat(queryFields),
				gr
			)
		)
		: undefined;
};

GlideQueryEvaluator.get = function get(glideQuery, key, fields) {
	var schema = Schema.of(glideQuery.table, fields || []);

	var pks = GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema);
	var value = GlideQueryEvaluator._getRawValue(glideQuery, key, schema, fields, pks);

	return value === undefined
		? Optional.empty("Unable to find a record in table '" + glideQuery.table + "' with key '" + key + "'")
		: Optional.of(value);
};

GlideQueryEvaluator.insert = function insert(glideQuery, changes, selectFields, prefetchedSchema) {
	if (!changes) {
		NiceError.raise('insert expects an Object to insert');
	}

	var queryFields = Object.keys(changes);
	var fields = queryFields.concat(selectFields);
	GlideQueryEvaluator.checkFieldsHaveNoFlag(queryFields, 'insert');
	var schema = prefetchedSchema || GlideQueryEvaluator.loadSchemaForTable(glideQuery, fields);
	selectFields.forEach(function (f) {
		Schema.checkField(schema, glideQuery.table, f);
	});
	var primaryKeys = GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema);
	var gr = GlideQueryEvaluator.createGlideRecord(glideQuery);
	GlideQueryEvaluator.setAllValuesToGlideRecord(schema, glideQuery.table, changes, gr);
	GlideQueryEvaluator.executePlan(glideQuery, gr, schema);
	GlideQueryEvaluator.recordUsage(glideQuery, gr.getTableScope(), 'create');
	var id = gr.insert();
	if (!id) {
		GlideQueryEvaluator.reportFailure('Failure to insert object', glideQuery.table, gr, changes);
	}

	return Optional.lazy(function () {
		return GlideQueryEvaluator._getRawValue(glideQuery, id, schema, fields, primaryKeys);
	});
};

GlideQueryEvaluator.checkFieldsHaveNoFlag = function (fields, name) {
	fields.forEach(function (f) {
		if (f.contains('$')) {
			NiceError.raise('Cannot use field flags when calling ' + name);
		}
	});
};

GlideQueryEvaluator.update = function update(glideQuery, changes, selectFields, reason, prefetchedSchema, insertWhenNotFound) {
	var plan = glideQuery.plan;
	var fieldsToChange = Object.keys(changes);
	var fields = fieldsToChange.concat(selectFields);
	GlideQueryEvaluator.checkFieldsHaveNoFlag(fieldsToChange, 'update');
	var schema = prefetchedSchema || GlideQueryEvaluator.loadSchemaForTable(glideQuery, fields);
	var primaryKeys = GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema);
	GlideQueryEvaluator.checkForPrimaryKeyWhere('update', primaryKeys, plan);
	var gr = GlideQueryEvaluator.createGlideRecord(glideQuery);
	GlideQueryEvaluator.executePlan(glideQuery, gr, schema);
	gr.setLimit(1);
	gr._query();
	if (!gr._next()) {
		if (insertWhenNotFound) {
			return GlideQueryEvaluator.insert(glideQuery, changes, selectFields, prefetchedSchema);
		}
		NiceError.raise('Cannot update: unable to find record');
	}
	GlideQueryEvaluator.setAllValuesToGlideRecord(schema, glideQuery.table, changes, gr);
	GlideQueryEvaluator.recordUsage(glideQuery, gr.getTableScope(), 'write');
	var id = gr.update(reason);
	if (!id) {
		GlideQueryEvaluator.reportFailure('Failure to update table', glideQuery.table, gr, changes);
	}
	return Optional.lazy(function () {
		return GlideQueryEvaluator._getRawValue(glideQuery, id, schema, fields, primaryKeys);
	});
};

GlideQueryEvaluator.reportFailure = function reportFailure(message, table, glideRecord, changes) {
	var errorObj = {
		message: message,
		table: table,
		lastGlideError: glideRecord.getLastErrorMessage(),
		changes: changes,
	};

	NiceError.raise(JSON.stringify(errorObj, null, 2));
};

GlideQueryEvaluator.insertOrUpdate = function insertOrUpdate(glideQuery, changes, selectFields, reason) {
	var schema = GlideQueryEvaluator.loadSchemaForTable(glideQuery, Object.keys(changes));
	var primaryKeys = GlideQueryEvaluator.getPrimaryKeysFromSchema(glideQuery.table, schema);
	var whereSteps = [];
	for (var pk in primaryKeys) {
		if (!changes[pk]) {
			return GlideQueryEvaluator.insert(glideQuery, changes, selectFields, schema);
		}
		whereSteps.push({
			type: 'where',
			field: pk,
			operator: '=',
			value: changes[pk],
			whereClause: true,
			action: GlideQueryActions.where(glideQuery.table, pk, '=', changes[pk]),
		});
	}

	var query = new GlideQuery(glideQuery.table, glideQuery.plan.concat(whereSteps));

	return GlideQueryEvaluator.update(query, changes, selectFields, reason, schema, true);
};

GlideQueryEvaluator.updateMultiple = function updateMultiple(glideQuery, changes) {
	var fields = Object.keys(changes);
	GlideQueryEvaluator.checkFieldsHaveNoFlag(fields, 'updateMultiple');
	var schema = GlideQueryEvaluator.loadSchemaForTable(glideQuery, fields);
	var glideRecord = GlideQueryEvaluator.createGlideRecord(glideQuery);
	GlideQueryEvaluator.executePlan(glideQuery, glideRecord, schema);
	GlideQueryEvaluator.setAllValuesToGlideRecord(schema, glideQuery.table, changes, glideRecord);
	GlideQueryEvaluator.recordUsage(glideQuery, glideRecord.getTableScope(), 'write');
	glideRecord.updateMultiple();
	return {
		rowCount: glideRecord.getRowCount(),
	};
};

GlideQueryEvaluator.del = function del(glideQuery) {
	var schema = GlideQueryEvaluator.loadSchemaForTable(glideQuery);
	var glideRecord = GlideQueryEvaluator.createGlideRecord(glideQuery);
	GlideQueryEvaluator.executePlan(glideQuery, glideRecord, schema);
	GlideQueryEvaluator.recordUsage(glideQuery, glideRecord.getTableScope(), 'delete');
	glideRecord.deleteMultiple();
};

GlideQueryEvaluator.setSingleValueToGlideRecord = function setSingleValueToGlideRecord(schema, table, field, value, glideRecord) {
	Schema.checkField(schema, table, field);
	Schema.checkFieldType(schema, table, field, value);
	Schema.checkChoice(schema, table, field, value);
	var glideType = schema[table][field].type;
	var glideValue = Schema.javaScriptValueToGlideValue(glideType, value);

	if (glideType === 'simple_name_values') {
		glideRecord[field] = glideRecord[field] || {};
		for (var k in value) {
			glideRecord[field][k] = value[k];
		}
	} else {
		glideRecord.setValue(field, glideValue);
	}
};

GlideQueryEvaluator.setAllValuesToGlideRecord = function setAllValuesToGlideRecord(schema, table, obj, glideRecord) {
	for (var field in obj) {
		var value = obj[field];
		GlideQueryEvaluator.setSingleValueToGlideRecord(schema, table, field, value, glideRecord);
	}
};

GlideQueryEvaluator.checkForPrimaryKeyWhere = function checkForPrimaryKeyWhere(action, primaryKeys, plan) {
	if (!plan.some(function (step) {
		return step.type === 'where' && primaryKeys[step.field];
	})) {
		NiceError.raise(action + " is missing 'where' clause(s) with primary key(s)");
	}
};

GlideQueryEvaluator.DATE_FILTERS = {
	today: 'javascript:gs.beginningOfToday()@javascript:gs.endOfToday()',
	yesterday: 'javascript:gs.beginningOfYesterday()@javascript:gs.endOfYesterday()',
	tomorrow: 'javascript:gs.beginningOfTomorrow()@javascript:gs.endOfTomorrow()',
	this_week: 'javascript:gs.beginningOfThisWeek()@javascript:gs.endOfThisWeek()',
	last_week: 'javascript:gs.beginningOfLastWeek()@javascript:gs.endOfLastWeek()',
	next_week: 'javascript:gs.beginningOfNextWeek()@javascript:gs.endOfNextWeek()',
	this_month: 'javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()',
	last_month: 'javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()',
	next_month: 'javascript:gs.beginningOfNextMonth()@javascript:gs.endOfNextMonth()',
	last_3_months: 'javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()',
	last_6_months: 'javascript:gs.beginningOfLast6Months()@javascript:gs.endOfLast6Months()',
	last_9_months: 'javascript:gs.beginningOfLast9Months()@javascript:gs.endOfLast9Months()',
	last_12_months: 'javascript:gs.beginningOfLast12Months()@javascript:gs.endOfLast12Months()',
	this_quarter: 'javascript:gs.beginningOfThisQuarter()@javascript:gs.endOfThisQuarter()',
	last_quarter: 'javascript:gs.beginningOfLastQuarter()@javascript:gs.endOfLastQuarter()',
	last_2_quarters: 'javascript:gs.beginningOfLast2Quarters()@javascript:gs.endOfLast2Quarters()',
	next_quarter: 'javascript:gs.beginningOfNextQuarter()@javascript:gs.endOfNextQuarter()',
	next_2_quarters: 'javascript:gs.beginningOfNext2Quarters()@javascript:gs.endOfNext2Quarters()',
	this_year: 'javascript:gs.beginningOfThisYear()@javascript:gs.endOfThisYear()',
	next_year: 'javascript:gs.beginningOfNextYear()@javascript:gs.endOfNextYear()',
};

GlideQueryEvaluator.encodeOnDateFilter = function (filter) {
	var cannedQuery = GlideQueryEvaluator.DATE_FILTERS[filter];
	if (cannedQuery) {
		return filter + '@' + cannedQuery;
	}

	if (filter.split('@').length < 3) {
		NiceError.raise("Unable to parse ON operator value '" + filter + "'");
	}

	return filter;
};
