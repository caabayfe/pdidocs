function Schema() {}

Schema.fromTable = function fromTable(table, fields) {
	var tableSchema = {};

	var tableDescriptor = GlideTableDescriptor.get(table);
	var glideTableSchema = tableDescriptor.getSchema();

	if (glideTableSchema.isEmpty()) {
		NiceError.raise("Unknown table: '" + table + "'");
	}

	var primaryKeys = Schema.getPrimaryKeys(tableDescriptor);
	var fieldMetadata = Schema.getFieldMetadata(table, glideTableSchema, fields, primaryKeys);

	for (var i in fieldMetadata) {
		var fm = fieldMetadata[i];
		var fieldSchema = glideTableSchema.get(fm.field);
		var tableReference = fieldSchema.getReference();
		tableSchema[fm.field] = {
			type: fieldSchema.getInternalType() + '',
			choices: fm.choices,
			choiceType: fm.choiceType,
			primary: primaryKeys[fm.field] || false,
			tableReference: tableReference ? (tableReference + '') : null,
		};
	}

	return tableSchema;
};

Schema.hasAccess = function hasAccess(table, operation) {
	return GlideTableDescriptor
		.get(table)
		.getAccessPolicy()
		.isPublic(operation);
};

Schema.getChoices = function getChoices(table, field) {
	var choices = {};
	var iterator = GlideChoiceListGenerator.getChoiceList(table, field).iterator();

	while (iterator.hasNext()) {
		var choice = iterator.next().getValue();
		if (choice) {
			choices[choice] = true;
		}
	}

	return Object.keys(choices).length < 1
		? null
		: choices;
};

Schema.javaCollectionToArray = function javaCollectionToArray(collection) {
	var arr = [];
	var iterator = collection.iterator();
	while (iterator.hasNext()) {
		arr.push(iterator.next());
	}
	return arr;
};

Schema.getFieldMetadata = function getFieldMetadata(table, glideTableSchema, requestedFields, primaryKeys) {
	var SUGGESTION_CHOICE = 2;
	var queryAll = Schema.queriesAllFields(requestedFields);
	var results = [];
	var fields = queryAll
		? Schema.javaCollectionToArray(glideTableSchema.keySet())
		: requestedFields.concat(Object.keys(primaryKeys));

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		var elementDescriptor = glideTableSchema.get(field);
		if (elementDescriptor) {
			var choiceType = elementDescriptor.getChoice();
			results.push({
				field: field,
				choiceType: choiceType,
				choices: choiceType && choiceType !== SUGGESTION_CHOICE
					? Schema.getChoices(table, field)
					: null,
			});
		}
	}

	return results;
};

Schema.queriesAllFields = function queriesAllFields(fields) {
	return fields.some(function (f) {
		return f === '*';
	});
};

Schema._schemaCache = {};
Schema.of = function of(table, fields, schema) {
	var cacheKey = table + ':' + fields.join(',');
	if (!schema && Schema._schemaCache[cacheKey]) {
		return Schema._schemaCache[cacheKey];
	}

	var completeSchema = schema || {};
	var simpleFields = fields
		.map(function (f) {
			return f.split('.')[0];
		})
		.map(function (f) {
			var flagIndex = f.indexOf('$');
			return flagIndex < 0 ? f : f.substring(0, flagIndex);
		});

	var tableSchema = Schema.fromTable(table, simpleFields);
	completeSchema[table] = completeSchema[table] || {};
	for (var field in tableSchema) {
		completeSchema[table][field] = tableSchema[field];
	}

	var nextLevelDotwalkTableAndFields = fields
		.filter(function (f) {
			return f.contains('.');
		})
		.map(function (f) {
			var tableAndField = f.split('.');
			var pureField = tableAndField[0];
			var tableReference = completeSchema[table][pureField].tableReference;
			if (!tableReference) {
				NiceError.raise("Cannot dotwalk field '" + pureField
				+ "' on table '" + table + "': not a reference field");
			}
			return {
				table: tableReference,
				field: tableAndField.slice(1).join('.'),
			};
		})
		.reduce(function (acc, info) {
			acc[info.table] = acc[info.table] || {};
			acc[info.table].fields = acc[info.table].fields || [];
			acc[info.table].fields.push(info.field);
			return acc;
		}, {});

	Object.keys(nextLevelDotwalkTableAndFields)
		.forEach(function (t) {
			Schema.of(t, nextLevelDotwalkTableAndFields[t].fields, completeSchema);
		});

	if (!schema) {
		Schema._schemaCache[cacheKey] = completeSchema;
	}

	return completeSchema;
};

Schema.getPrimaryKeys = function getPrimaryKeys(tableDescriptor) {
	var indexes = tableDescriptor.getIndexDescriptors().values().iterator();
	var fields = {};

	while (indexes.hasNext()) {
		var index = indexes.next();

		if (index.isPrimary()) {
			var pkFields = index.getFields();
			for (var i = 0; i < pkFields.size(); i++) {
				fields[pkFields.get(i)] = true;
			}
		}
	}

	return fields;
};

Schema.DateRegex = new RegExp(/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/);
Schema.DateTimeRegex = new RegExp(
	/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])\s(([0-1]?[0-9]|2?[0-3]):([0-5][0-9]):([0-5][0-9]))$/
);
Schema.IDRegex = new RegExp(/^[0-9a-f]{32}$/);
Schema.Currency = new RegExp(/^[A-Z]{3};[-+]?((\d+\.?\d*)|(\d*\.?\d+))$/);
Schema.NumberTypes = {
	integer: true,
	longint: true,
	'float': true, // eslint-disable-line quote-props
	'double': true, // eslint-disable-line quote-props
	currency: true,
};

Schema.MAX_INT = 2147483647;
Schema.MIN_INT = -2147483648;
Schema.MAX_SAFE_LONG = 9007199254740991;
Schema.MIN_SAFE_LONG = -9007199254740991;

Schema.isNumericField = function isNumericField(fieldType) {
	return !!Schema.NumberTypes[fieldType];
};

Schema.checkSumOrAvgHasNumericType = function checkSumOrAvgHasNumericType(schema, table, field, aggregateFunc) {
	var glideType = schema[table][field].type;

	if (!Schema.isNumericField(glideType)) {
		throw new Error(
			"Aggregate function '" + aggregateFunc
			+ "' can only be used on fields with a type from one of the following: "
			+ Object.keys(Schema.NumberTypes).join(', ')
			+ '. Field ' + field + ' has type ' + glideType + '.'
		);
	}
};

Schema.isMathematicalInteger = function isMathematicalInteger(value) {
	return isFinite(value) && Math.floor(value) === value;
};

Schema.valueMatchesExpectedType = function valueMatchesExpectedType(expectedType, value) {
	if (value === null || value === '') {
		return true;
	}

	if (value === undefined) {
		return false;
	}

	var isString = JSUtil.instance_of(value, 'java.lang.String');
	var isJsExpression = isString && value.startsWith('javascript:');
	if (isJsExpression) {
		return true;
	}

	switch (expectedType) {
	case 'reference':
	case 'GUID':
		return isString && value.trim() !== '';
	case 'boolean':
		return JSUtil.instance_of(value, 'java.lang.Boolean') || value === 'true' || value === 'false';
	case 'integer':
		var numberForm = isString ? parseFloat(value) : value;
		return Schema.isMathematicalInteger(numberForm) && numberForm <= Schema.MAX_INT && numberForm >= Schema.MIN_INT;
	case 'longint':
		var numberForm = isString ? parseFloat(value) : value;
		return Schema.isMathematicalInteger(numberForm) && value <= Schema.MAX_SAFE_LONG && value >= Schema.MIN_SAFE_LONG;
	case 'glide_date':
		return (value instanceof Date && value.toString() !== 'Invalid Date')
			|| Schema.DateRegex.test(value.toString());
	case 'glide_date_time':
		return (value instanceof Date && value.toString() !== 'Invalid Date')
			|| Schema.DateTimeRegex.test(value.toString());
	case 'float':
	case 'double':
	case 'decimal':
		return isFinite(isString ? parseFloat(value) : value)
	case 'currency':
		return (JSUtil.instance_of(value, 'java.lang.Double') && isFinite(value))
			|| isString && isFinite(parseFloat(value))
			|| Schema.Currency.test(value);
	case 'simple_name_values':
		return Object.prototype.toString.call(value) === '[object Object]';
	case 'string':
		return isString;
	default:
		return true;
	}
};

Schema.checkFieldType = function checkFieldType(schema, table, field, value) {
	if (!Array.isArray(field) && !field.contains('.')
		&& Schema.valueMatchesExpectedType(schema[table][field].type, value)) {
		return;
	}

	var values = [].concat(value);

	for (var i = 0; i < values.length; i++) {
		var errorMessage = Schema.findInvalidTypeError(schema, table, field, values[i]);
		if (errorMessage) {
			NiceError.raise(errorMessage);
		}
	}
};

Schema.findInvalidTypeError = function findInvalidTypeError(tableSchema, table, field, value) {
	var dotwalk = Schema.dotwalkField(tableSchema, table, field);
	var expectedType = tableSchema[dotwalk.table][dotwalk.field].type;
	if (!Schema.valueMatchesExpectedType(expectedType, value)) {
		var printableValue = JSUtil.instance_of(value, 'java.lang.String')
			? "'" + value + "'"
			: value;
		return 'Unable to match value ' + printableValue + " with field '" + dotwalk.field
		+ "' in table '" + dotwalk.table + "'. Expecting type '" + expectedType + "'";
	}
	return null;
};

Schema.zeroPad = function zeroPad(num) {
	return num < 10 ? ('0' + num) : num.toString();
};

Schema.formatDate = function formatDate(jsDate) {
	var month = jsDate.getUTCMonth() + 1;
	var day = jsDate.getUTCDate();
	return jsDate.getUTCFullYear() + '-' + Schema.zeroPad(month) + '-' + Schema.zeroPad(day);
};

Schema.javaScriptValueToGlideValue = function javaScriptValueToGlideValue(glideType, jsValue) {
	if (jsValue === null) {
		return 'NULL';
	}
	if (jsValue === undefined) {
		NiceError.raise("Cannot convert undefined into glide value '" + glideType + "'");
	}

	switch (glideType) {
	case 'glide_date':
		if (JSUtil.instance_of(jsValue, 'java.lang.String')) {
			return jsValue;
		}

		if (jsValue instanceof Date) {
			return Schema.formatDate(jsValue);
		}

		return jsValue;
	case 'glide_date_time':
		if (JSUtil.instance_of(jsValue, 'java.lang.String')) {
			return jsValue;
		}

		if (jsValue instanceof Date) {
			var hour = jsValue.getUTCHours();
			var minutes = jsValue.getUTCMinutes();
			var seconds = jsValue.getUTCSeconds();
			return Schema.formatDate(jsValue) + ' ' + Schema.zeroPad(hour)
				+ ':' + Schema.zeroPad(minutes) + ':' + Schema.zeroPad(seconds);
		}

		return jsValue;
	default:
		return jsValue;
	}
};

Schema.findMissingFieldError = function findMissingFieldError(schema, table, field) {
	var allFields = field.split('.');
	var currentField = field;
	var currentTable = table;

	for (var i = 0; i < allFields.length; i++) {
		currentField = allFields[i];

		if (!schema[currentTable]) {
			return "Table '" + currentTable + "' not found in schema";
		}

		if (!schema[currentTable][currentField]) {
			var availableFields = Object.keys(Schema.of(currentTable, ['*'])[currentTable]);
			return "Unknown field '" + currentField + "' in table '" + currentTable
				+ "'. Known fields:\n" + JSON.stringify(availableFields, null, 2);
		}
		if (i < allFields.length - 1) {
			currentTable = schema[currentTable][currentField].tableReference || currentTable;
		}
	}
	return null;
};

Schema.wordSearchOperators = {
	'123TEXTQUERY321': true,
	IR_AND_QUERY: true,
	IR_OR_QUERY: true,
};

Schema.checkField = function (schema, table, rawField) {
	var flagIndex = rawField.indexOf('$');
	var field = flagIndex < 0 ? rawField : rawField.substring(0, flagIndex);

	if ((!field.contains('.') && schema[table][field]) || Schema.wordSearchOperators[field]) {
		return;
	}

	var errorMessage = Schema.findMissingFieldError(schema, table, field);
	if (errorMessage) {
		NiceError.raise(errorMessage);
	}
};

Schema.operatorsToUseWithChoiceChecking = {
	'=': true,
	'!=': true,
	'IN': true,
	'NOT IN': true,
};

Schema.checkChoice = function checkChoice(schema, table, field, value, operator) {
	if (operator && !Schema.operatorsToUseWithChoiceChecking[operator]) {
		return;
	}

	if (JSUtil.instance_of(value, 'java.lang.String') && value.startsWith('javascript:')) {
		return;
	}

	if (!field.contains('.') && !schema[table][field].choices) {
		return;
	}

	[].concat(value).forEach(function (v) {
		var errorMessage = Schema.findInvalidChoiceError(schema, table, field, v);
		if (errorMessage) {
			NiceError.raise(errorMessage);
		}
	});
};

Schema.dotwalkField = function dotwalkField(tableSchema, table, field) {
	var allFields = field.split('.');
	var lastField = allFields[allFields.length - 1];
	var lastFieldTable = allFields.reduce(function (t, curField, i) {
		return i < allFields.length - 1
			? tableSchema[t][curField].tableReference || table
			: t;
	}, table);

	return {
		field: lastField,
		table: lastFieldTable,
	};
};

Schema.findInvalidChoiceError = function findInvalidChoiceError(tableSchema, table, field, value) {
	if (value === null || (typeof value === 'string' && value.toLowerCase() === 'null')) {
		return null;
	}
	var dotWalk = Schema.dotwalkField(tableSchema, table, field);

	var fieldSchema = tableSchema[dotWalk.table][dotWalk.field];
	if (fieldSchema.choiceType === 1 && value === '') {
		return null;
	}
	var allowedChoices = fieldSchema.choices;
	if (allowedChoices && !allowedChoices[value.toString()]) {
		var choiceList = [];
		for (var v in allowedChoices) {
			choiceList.push(v);
		}

		return "Invalid choice '" + value + "' for field '" + dotWalk.field
			+ "' (table '" + dotWalk.table + "'). Allowed values:\n" + JSON.stringify(choiceList, null, 2);
	}
	return null;
};
