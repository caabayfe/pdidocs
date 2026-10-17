function GlideToJavaScriptMapper() {}

// This function returns a function that, when called, returns the next
// record: a JavaScript object representing the selected fields in a GlideRecord
GlideToJavaScriptMapper.createNextJsFn = function createNextJsFn(glideQuery, session) {
    if (session.isAggregate) {
        return GlideToJavaScriptMapper.createAggregateValuesToJsFn(
            glideQuery,
            session.schema,
            session.glideRecord,
            session.fields
        );
    }

    var recordCopier = GlideToJavaScriptMapper.getRecordCopierFn(
        glideQuery.table,
        session.schema,
        session.fields,
        session.glideRecord
    );

    return function() {
        return GlideToJavaScriptMapper.copyRecord(recordCopier);
    };
};

GlideToJavaScriptMapper.copyRecord = function copyRecord(recordCopier) {
    var obj = {};

    for (var field in recordCopier) {
        recordCopier[field](obj);
    }

    return obj;
};

GlideToJavaScriptMapper.supportedFlags = {
    DISPLAY: '*',
    CURRENCY_CODE: 'currency',
    CURRENCY_STRING: 'currency',
    CURRENCY_DISPLAY: 'currency',
};

GlideToJavaScriptMapper.parseField = function(schema, table, rawField) {
    var parts = rawField.split('$');
    var field = parts[0];
    var flag = parts[1] || null;
    var flagType = GlideToJavaScriptMapper.supportedFlags[flag];
    var fieldType = schema[table][field].type

    if (flag) {
        if (!flagType) {
            NiceError.raise(
                "Unknown flag '" + flag + "'. Expecting one of " +
                JSON.stringify(Object.keys(GlideToJavaScriptMapper.supportedFlags))
            );
        }

        if (flagType !== '*' && flagType !== fieldType) {
            NiceError.raise("Field '" + field + "' is not a currency field");
        }
    }

    return {
        field: field,
        flag: flag,
    };
};

GlideToJavaScriptMapper.getGetValueFunction = function(glideRecord, schema, table, rawField) {
    var parsed = GlideToJavaScriptMapper.parseField(schema, table, rawField);
    switch (parsed.flag) {
        case 'DISPLAY':
            return function(obj) {
                obj[rawField] = glideRecord[parsed.field].getDisplayValue();
            };
        case 'CURRENCY_CODE':
            return function(obj) {
                obj[rawField] = glideRecord[parsed.field].getCurrencyCode();
            };
        case 'CURRENCY_DISPLAY':
            return function(obj) {
                obj[rawField] = glideRecord[parsed.field].getCurrencyDisplayValue();
            };
        case 'CURRENCY_STRING':
            return function(obj) {
                obj[rawField] = glideRecord[parsed.field].getCurrencyString();
            };
        default:
            var glideType = schema[table][parsed.field].type;
            var toJsFn = GlideToJavaScriptMapper.maybeGetGlideToJsFn(glideType);
            return toJsFn ?
                function(obj) {
                    obj[rawField] = toJsFn(glideRecord[parsed.field].getValue());
                } :
                function(obj) {
                    obj[rawField] = glideRecord[parsed.field] ? glideRecord[parsed.field].getValue() : null;
                };

    }
};

GlideToJavaScriptMapper.getRecordCopierFn = function getRecordCopierFn(table, schema, fields, glideRecord) {
    return fields.reduce(function(acc, f) {
        acc[f] = f.contains('.') ?
            GlideToJavaScriptMapper.getCopyDotwalkValuesFunction(glideRecord, schema, table, f) :
            GlideToJavaScriptMapper.getGetValueFunction(glideRecord, schema, table, f);

        return acc;
    }, {});
};

GlideToJavaScriptMapper.getGlideToJsFn = function getGlideToJsFn(glideType) {
    return GlideToJavaScriptMapper.maybeGetGlideToJsFn(glideType) || function(value) {
        return value;
    };
};

GlideToJavaScriptMapper.getCopyDotwalkValuesFunction = function getCopyDotwalkValuesFunction(glideRecord, schema, table, field) {
    var fields = field.split('.');
    var rawLastField = fields[fields.length - 1];
    var path = fields.slice(0, fields.length - 1);
    var lastTable = path.reduce(function(t, f) {
        return schema[table][f].tableReference || t;
    }, table);
    var parsed = GlideToJavaScriptMapper.parseField(schema, lastTable, rawLastField);

    return function(existingRecord) {
        var record = existingRecord || {};
        var glideObject = glideRecord;
        var currentTable = table;

        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            if (i < fields.length - 1) {
                if (glideObject.getValue(f) === null) {
                    record[f] = null;
                    break;
                }
                record[f] = record[f] || {};
                record = record[f];
                glideObject = glideObject[f];
                var currentTable = schema[currentTable][f].tableReference || currentTable;
            } else {
                if (glideObject[parsed.field].nil()) {
                    record[f] = null;
                } else {
                    var putValueOnRecord = GlideToJavaScriptMapper.getGetValueFunction(glideObject, schema, currentTable, rawLastField);
                    putValueOnRecord(record);
                }
            }
        }
    };
};

GlideToJavaScriptMapper.maybeGetGlideToJsFn = function maybeGetGlideToJsFn(glideType) {
    switch (glideType) {
        case 'boolean':
            return function(glideValue) {
                return glideValue === null ? null : (glideValue === '1' || glideValue === 'true');
            };
        case 'glide_date':
        case 'glide_date_time':
            return function(glideValue) {
                return glideValue === '' ? null : glideValue;
            };
        case 'integer':
        case 'longint':
            return function(glideValue) {
                return glideValue === '' || glideValue === null ?
                    null :
                    parseInt(glideValue, 10);
            };
        case 'float':
        case 'double':
        case 'decimal':
        case 'currency':
            return function(glideValue) {
                return glideValue === '' || glideValue === null || glideValue === undefined ? null : parseFloat(glideValue);
            };
        case 'simple_name_values':
            return JSON.parse;
        default:
            return null;
    }
};

GlideToJavaScriptMapper.createAggregateValuesToJsFn = function createAggregateValuesToJsFn(glideQuery, schema, glideRecord, groups) {
    var aggregationSteps = glideQuery.plan
        .filter(function(step) {
            return GlideQueryEvaluator.aggregateQueries[step.type];
        });

    var groupValueCopier = groups.reduce(function(acc, g) {
        var glideType = schema[glideQuery.table][g].type;
        acc[g] = GlideToJavaScriptMapper.getGlideToJsFn(glideType);
        return acc;
    }, {});

    return function() {
        return aggregationSteps
            .reduce(function(acc, step) {
                if (groups) {
                    groups.forEach(function(g) {
                        acc.group = acc.group || {};
                        acc.group[g] = groupValueCopier[g](glideRecord.getValue(g));
                    });
                }
                var value = glideRecord.getAggregate(step.type, step.field);
                if (step.type === 'count') {
                    acc.count = parseFloat(value);
                } else {
                    acc[step.type] = acc[step.type] || {};
                    var glideType = schema[glideQuery.table][step.field].type;
                    acc[step.type][step.field] = Schema.isNumericField(glideType) ?
                        (value || null) && parseFloat(value) :
                        value;
                }
                return acc;
            }, {});
    };
};
