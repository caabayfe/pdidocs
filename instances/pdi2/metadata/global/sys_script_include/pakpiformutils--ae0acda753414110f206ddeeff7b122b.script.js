var PAKPIFormUtils = Class.create();
PAKPIFormUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isDailyFrequency: function() {
        var source_id = this.getParameter("sysparm_source_id");
        var gr = new GlideRecordSecure('pa_dm_analytics_source');
        gr.addQuery('sys_id', source_id);
        gr.query();

        var isDaily = false;
        if (gr.next()) {
            var frequency = gr.getValue("frequency");
            if (frequency == "daily") {
                isDaily = true;
            }
        }

        var result = this.newItem("result");
        result.setAttribute("is_daily", isDaily);
        return result;
    },
    analytics_source_trendby_fields: function() {
        var source_id = this.getParameter("sysparm_source_id");
		var trendByDimensions = SNC.PADataSnapshotFormUtils.getTrendByFields(source_id);
		var result = this.newItem("result");
        result.setAttribute("trendby_fields", trendByDimensions);
    },

    analytics_source_aggregates: function() {
        var source_id = this.getParameter("sysparm_source_id");
        var aggregate_type = this.getParameter("sysparm_aggregate");
        var aggregatableDimensions = SNC.PADataSnapshotFormUtils.getAggregateOnFields(source_id,aggregate_type);
        var result = this.newItem("result");
        result.setAttribute("aggregate", aggregatableDimensions);
    },

    getBusinessCalendarBasedOnTZ: function(current) {
        var choices = [];
        var source_frequency;
        var source_id = current.analytics_source;
        var selected_calendar = current.calendar;

        var calendarChoiceList = new GlideChoiceList();
        if (selected_calendar == 'standard')
            return calendarChoiceList;

        var groupSysId = selected_calendar;
        if (JSUtil.nil(groupSysId))
            return calendarChoiceList;

        var gr = new GlideRecordSecure('pa_dm_analytics_source');
        gr.addQuery('sys_id', source_id);
        gr.query();
        if (gr.next()) {
            source_tz = gr.getValue('run_as_tz');
            source_frequency = gr.getValue('frequency');
        }

        var mtom = new GlideRecord('m2m_business_calendar_group_business_calendars');
        mtom.addQuery('business_calendar_group', selected_calendar);
        mtom.query();
        while (mtom.next()) {
            var element = mtom.getElement('business_calendar');
            if (source_frequency == 'daily')
                choices.push(this.getCalendarRecordJSON(element.getValue(), source_tz));
            else
                choices.push(element.getValue());
        }
        return "sys_idIN" + choices.join(",");
    },

    getCalendarRecordJSON: function(id, tz) {
        var calendarEntry = {};
        var bcRecord = new GlideRecord('business_calendar');
        bcRecord.addQuery('sys_id', id);
        bcRecord.addQuery('time_zone', tz);
        bcRecord.query();
        if (bcRecord.next()) {
            if (!JSUtil.nil(bcRecord.getValue('calendar_name'))) {
                return bcRecord.getValue('sys_id');
            }
        }
    },

    usedInDataSnapshotsFormulaIndicators: function(datasnapshot_indicator_sys_id) {
        var dataSnapshotsFormula = new GlideRecord('pa_datasnapshot_indicator');
        dataSnapshotsFormula.addQuery("type", "12"); // dataSnapshotsFormula indicators only
        dataSnapshotsFormula.addQuery("formula", "CONTAINS", datasnapshot_indicator_sys_id);
        dataSnapshotsFormula.setLimit(1);
        dataSnapshotsFormula.query();
        return dataSnapshotsFormula.hasNext();
    },

    validConditionCheck: function(table, conditionString, source_id) {
        var unsupported_fields = new global.PAKPIFormUtils().unSupportedConditionFields(table, conditionString, source_id);
        for (var i = 0; i < unsupported_fields.length; i++) {
            var unsupported_field = unsupported_fields[i];
            if (unsupported_field.value.length > 0)
                return false;

        }
        return true;
    },

unSupportedConditionFields: function(table, conditionString, source_id) {
    var unsupported_fields = [];
    var td = GlideTableDescriptor.get(table);

    // Extract condition fields from the query string
    var conditionFields = [];
    var queryString = new GlideQueryString(table, conditionString);
    queryString.deserialize();
    var terms = queryString.getTerms();
    for (var j = 0; j < terms.size(); j++) {
        var term = terms.get(j);
        if (gs.nil(term)) continue;

        var conditionField = term.getField();
        if (gs.nil(conditionField)) continue;

        var lhs = String(conditionField);
        if (lhs.indexOf('@') > -1) lhs = lhs.split('@')[0];
        conditionFields.push(lhs);

        var op = String(term.getOperator() || "").toUpperCase();
        if (op === "SAMEAS" || op === "NSAMEAS") {
            var rhsField = String(term.getValue() || "").trim();
            if (!gs.nil(rhsField)) {
                if (rhsField.indexOf('@') > -1) rhsField = rhsField.split('@')[0];
                conditionFields.push(rhsField);
            }
        }
    }

    // Check each field against pa_dm_analytics_source.dimension
    var unsupported_condition_field = {};
    unsupported_condition_field.key = GlideSysMessage.getMessage("Conditions");
    unsupported_condition_field.value = [];

    // Fetch dimensions once
    var dimSet = {};
    var gr = new GlideRecordSecure('pa_dm_analytics_source');
    if (gr.get(source_id)) {
        var dims = gr.getValue("dimensions");
        if (!gs.nil(dims)) {
            var dimList = dims.split(',');
            for (var i = 0; i < dimList.length; i++) {
                dimSet[dimList[i].trim()] = true;
            }
        }
    }

    for (var i = 0; i < conditionFields.length; i++) {
        var cField = conditionFields[i];
        // Handle special case for 123TEXTQUERY321
        if (cField === "123TEXTQUERY321") {
            unsupported_condition_field.value.push(gs.getMessage("Keyword"));
            continue;
        }

        if (!dimSet.hasOwnProperty(cField)) {
            var fieldValueQuery = table + "." + cField;
            var label = new GlideCompositeElement(fieldValueQuery).getFullLabel();
            unsupported_condition_field.value.push(label);
        }

    }

    unsupported_fields.push(unsupported_condition_field);

    var unsupportedOps = this._getUnsupportedOperators(table, conditionString);
    if (unsupportedOps.length > 0) {
        var unsupported_operators = {};
        unsupported_operators.key = GlideSysMessage.getMessage("Unsupported Operators");
        unsupported_operators.value = [];

        for (var k = 0; k < unsupportedOps.length; k++) {
            var op = unsupportedOps[k];
            var message = op.fieldLabel + ' (' + op.operatorLabel + '): ' + op.message;
            unsupported_operators.value.push(message);
        }

        unsupported_fields.push(unsupported_operators);
    }

    return unsupported_fields;
},

_getUnsupportedOperators: function(table, conditionString) {
    var unsupportedOperators = [];

    if (gs.nil(table) || gs.nil(conditionString)) {
        return unsupportedOperators;
    }

    var queryString = new GlideQueryString(table, conditionString);
    queryString.deserialize();
    var terms = queryString.getTerms();
    var td = GlideTableDescriptor.get(table);
    for (var i = 0; i < terms.size(); i++) {
        var term = terms.get(i);
        if (gs.nil(term)) continue;
        // Get field name first to check if term has a field
        var fieldName = String(term.getField() || '');
        if (gs.nil(fieldName) || fieldName == '') continue;

        var ed = td.getLastElementDescriptor(fieldName);
        if (gs.nil(ed)) continue;

        var operator = String(term.getOperator() || '');
        var fieldName = String(term.getField() || '');

        if (gs.nil(fieldName)) continue;
        var fieldLabel = new GlideCompositeElement(table + "." + fieldName).getFullLabel() || fieldName;
        if (ed.getInternalType() == 'sys_class_name' && operator == 'INSTANCEOF') {
            unsupportedOperators.push({
                field: fieldName,
                fieldLabel: fieldLabel,
                operator: operator,
                operatorLabel: 'instance of',
                message: 'The "instance of" operator is not supported for sys_class_name fields'
            });
            continue;
        }

        if (ed.isReference() && operator == 'IN_HIERARCHY_DYNAMIC') {
           	unsupportedOperators.push({
                  field: fieldName,
                  fieldLabel: fieldLabel,
                  operator: operator,
                  operatorLabel: 'is in hierarchy - dynamic',
                  message: 'The "in hierarchy (dynamic)" operator is not supported for reference fields'
            });
            continue;
         }

        if (ed.isString() && (operator == 'MATCH_PAT' || operator == 'MATCH_RGX')) {
            var opLabel = operator == 'MATCH_PAT' ? 'matches pattern' : 'matches regex';
            unsupportedOperators.push({
                field: fieldName,
                fieldLabel: fieldLabel,
                operator: operator,
                operatorLabel: opLabel,
                message: 'Pattern matching operators are not supported for string fields'
            });
            continue;
        }

        if (ed.getInternalType() == 'currency') {
            var currencyUnsupportedOps = {
                '=': 'equals',
                '!=': 'not equals',
                '<': 'less than',
                '>': 'greater than',
                '<=': 'less than or equals',
                '>=': 'greater than or equals',
                'BETWEEN': 'between'
            };

            if (currencyUnsupportedOps.hasOwnProperty(operator)) {
                unsupportedOperators.push({
                    field: fieldName,
                    fieldLabel: fieldLabel,
                    operator: operator,
                    operatorLabel: currencyUnsupportedOps[operator],
                    message: 'Comparison operators are not supported for currency fields'
                });
            }
        }
    }

    var uniqueOperators = [];
    var seen = {};
    for (var j = 0; j < unsupportedOperators.length; j++) {
        var key = unsupportedOperators[j].field + '_' + unsupportedOperators[j].operator;
        if (!seen[key]) {
            seen[key] = true;
            uniqueOperators.push(unsupportedOperators[j]);
        }
    }

    return uniqueOperators;
},

    type: 'PAKPIFormUtils'
});
