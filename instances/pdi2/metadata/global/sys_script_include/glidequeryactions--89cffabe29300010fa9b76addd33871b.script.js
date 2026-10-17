function GlideQueryActions() {}

GlideQueryActions.where = function where(table, field, operator, value) {
	return function (context) {
		GlideQueryActions.checkWhere(context.schema, table, field, operator, value);
	};
};

GlideQueryActions.whereNestedQuery = function whereNestedQuery(table, query) {
	return function (context) {
		var tableManager = GlideDBObjectManager.get();
		if (query.table && !tableManager.isInstanceOf(table, query.table)) {
			NiceError.raise("Cannot use GlideQuery of table '"
				+ query.table
				+ "' in a where expression of table '"
				+ table
				+ "'");
		}
		query.plan
			.filter(function (step) { return step.whereClause && !step.query; })
			.forEach(function (step) {
				GlideQueryActions.checkWhere(
					context.schema,
					query.table || table,
					step.field,
					step.operator,
					step.value
				);
			});
	};
};

GlideQueryActions.checkField = function checkField(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
	};
};

GlideQueryActions.checkDynamicFilter = function checkDynamicFilter(schema, table, field, filterId) {
	var dynamicFilterGr = new GlideRecord('sys_filter_option_dynamic');
	dynamicFilterGr.addQuery('active', true);
	dynamicFilterGr.addQuery('sys_id', filterId);
	dynamicFilterGr.setLimit(1);
	dynamicFilterGr.query();
	if (!dynamicFilterGr.next()) {
		NiceError.raise("Dynamic filter option '" + filterId + "' does not exist");
	}

	var fieldType = dynamicFilterGr.getValue('field_type');
	if (fieldType) {
		var fieldTypeGr = new GlideRecord('sys_glide_object');
		if (fieldTypeGr.get(fieldType)) {
			var type = fieldTypeGr.getValue('name');
			if (type !== schema[table][field].type) {
				NiceError.raise("Dynamic filter '" + filterId + "' cannot be used on field '" + field + "'. Expecting a field of type '" + type + "'")
			}

			var dynamicFilterTable = dynamicFilterGr.getValue('table');
			var fieldReferenceTable = schema[table][field].tableReference;
			if (type === 'reference' && dynamicFilterTable !== fieldReferenceTable) {
 				NiceError.raise("Dynamic filter '" + filterId + "' cannot be used on reference field '" + field + "'. Expecting a reference to '" + dynamicFilterTable + "', but found a reference to '" + fieldReferenceTable + "'");
			}
		}
	}
};

GlideQueryActions.ON_DATE_FILTER_TYPES = {
	glide_date: true,
	glide_date_time: true,
	datetime: true,
	due_date: true,
};

GlideQueryActions.checkOnDateFilter = function (schema, table, field, value) {
	var type = schema[table][field].type;
	if (!GlideQueryActions.ON_DATE_FILTER_TYPES[type]) {
		NiceError.raise(
			"Unable to use ON operator on field '" + field +
			"' in table '" + table +
			"'. ON only works on fields of type: " + Object.keys(GlideQueryActions.ON_DATE_FILTER_TYPES).join(', ')
		);
	}
};

Schema.checkFieldTypesMatch = function (schema, table, operator, field1, field2) {
	var type1 = schema[table][field1].type;
	var type2 = schema[table][field2].type;
	if (type1 !== type2) {
		NiceError.raise("Cannot use " + operator + " operator with fields '" + field1 + "' and '" + field2 + "', since they are of different types");
	}
};

GlideQueryActions.checkWhere = function checkWhere(schema, table, field, operator, value) {
	Schema.checkField(schema, table, field);

	if (operator) {
		if (GlideQueryEvaluator.FieldComparisonOperators[operator]) {
			Schema.checkField(schema, table, value);
			Schema.checkFieldTypesMatch(schema, table, operator, field, value);
			return;
		}

		if (operator === 'DYNAMIC') {
			GlideQueryActions.checkDynamicFilter(schema, table, field, value);
		}

		if (operator === 'ON') {
			GlideQueryActions.checkOnDateFilter(schema, table, field, value);
			return;
		}

		Schema.checkFieldType(schema, table, field, value);
		Schema.checkChoice(schema, table, field, value, operator);
	}
};

GlideQueryActions.disableWorkflow = function disableWorkflow(context) {
	context.glideRecord.setWorkflow(false);
};

GlideQueryActions.disableAutoSysFields = function disableAutoSysFields(context) {
	context.glideRecord.autoSysFields(false);
};

GlideQueryActions.forceUpdate = function forceUpdate(context) {
	context.glideRecord.setForceUpdate(true);
};

GlideQueryActions.orderBy = function orderBy(table, field) {
	return function (context) {
		if (context.plan.some(function (step) { return step.aggregate; })) {
			NiceError.raise('orderBy cannot be used with aggregate()');
		}
		Schema.checkField(context.schema, table, field);
	};
};

GlideQueryActions.orderByDesc = function orderByDesc(table, fieldOrAggregateType, aggregatedField) {
	return function (context) {
		var aggregateQueries = context.plan.some(function (s) { return s.aggregate; });

		if (aggregateQueries) {
			GlideQueryActions.checkValidAggregate(fieldOrAggregateType);
			Schema.checkField(context.schema, table, aggregatedField);
			GlideQueryEvaluator.checkAggregatePlanHasGroupByAndMatchingAggregate(
				context.plan,
				fieldOrAggregateType,
				aggregatedField,
				'orderByDesc'
			);
			context.glideRecord.orderByAggregate(fieldOrAggregateType, aggregatedField);
		} else {
			Schema.checkField(context.schema, table, fieldOrAggregateType);
		}
	};
};

GlideQueryActions.limit = function limit(limit) {
	return function (context) {
		GlideQueryEvaluator.checkIfAggregate('limit', context.plan);
		context.glideRecord.setLimit(limit);
	};
};

GlideQueryActions.avg = function avg(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
		Schema.checkSumOrAvgHasNumericType(context.schema, table, field, 'avg');
		context.glideRecord.addAggregate('avg', field);
	};
};

GlideQueryActions.sum = function sum(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
		Schema.checkSumOrAvgHasNumericType(context.schema, table, field, 'sum');
		context.glideRecord.addAggregate('sum', field);
	};
};

GlideQueryActions.max = function max(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
		context.glideRecord.addAggregate('max', field);
	};
};

GlideQueryActions.min = function min(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
		context.glideRecord.addAggregate('min', field);
	};
};

GlideQueryActions.count = function count(context) {
	context.glideRecord.addAggregate('count');
};

GlideQueryActions.groupBy = function groupBy(table, field) {
	return function (context) {
		Schema.checkField(context.schema, table, field);
		context.glideRecord.groupBy(field);
	};
};

GlideQueryActions.aggregate = function aggregate(table, field, aggregateType) { // eslint-disable-line consistent-return
	switch (aggregateType.toLowerCase()) {
	case 'avg':
		return GlideQueryActions.avg(table, field);
	case 'count':
		return GlideQueryActions.count;
	case 'max':
		return GlideQueryActions.max(table, field);
	case 'min':
		return GlideQueryActions.min(table, field);
	case 'sum':
		return GlideQueryActions.sum(table, field);
	default:
		NiceError.raise('Invalid aggregate type: ' + aggregateType);
	}
};

GlideQueryActions.having = function having(table, field, operator, value, aggregateType) {
	return function (context) {
		GlideQueryActions.checkValidAggregate(aggregateType);
		Schema.checkField(context.schema, table, field);
		GlideQueryEvaluator.checkAggregatePlanHasGroupByAndMatchingAggregate(
			context.plan,
			aggregateType,
			field,
			'having'
		);
		context.glideRecord.addHaving(aggregateType, field, operator, value);
	};
};

GlideQueryActions.setValue = function setValue(table, field, value) {
	return function (context) {
		GlideQueryEvaluator.checkIfAggregate('setValue', context.plan);
		GlideQueryEvaluator.setSingleValueToGlideRecord(context.schema, table, field, value, context.glideRecord);
	};
};

GlideQueryActions.checkValidAggregate = function checkValidAggregate(aggregate) {
	if (!GlideQueryEvaluator.aggregateQueries[aggregate]) {
		NiceError.raise("Unknown aggregate '" + aggregate + "'");
	}
};
