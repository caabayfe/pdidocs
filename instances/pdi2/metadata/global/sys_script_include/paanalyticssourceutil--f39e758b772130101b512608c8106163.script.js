var PAAnalyticsSourceUtil = Class.create();
PAAnalyticsSourceUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    alreadyActivated: function(sourceID) {
        var gr = new GlideRecord("pa_dm_source_state");
        gr.addQuery("analytics_source", sourceID);
        gr.query();
        return gr.next();
    },
    createSourceInfo: function(sourceID) {
        var prop = '{"next_date_supported" : true}';
        var gr = new GlideRecord("pa_dm_source_state");
        gr.initialize();
        gr.setValue("analytics_source", sourceID);
        if (gr.isValidField("feature_flags"))
            gr.setValue("feature_flags", prop);

        gr.insert();
        gr.close();
    },
    hasNextDate: function() {
        var source_id = this.getParameter("sysparm_source_id");
        var gr = new GlideRecord("pa_dm_source_state");
        gr.addQuery("analytics_source.sys_id", source_id);
        gr.query();
        var answer = false;
        if (gr.next()) {
            var prop;
            if (gr.isValidField("feature_flags"))
                prop = gr.getValue("feature_flags");

            if (gs.nil(prop))
                answer = false;
            else {
                var propObj = JSON.parse(prop);
                if (gs.nil(propObj.next_date_supported))
                    answer = false;
                else
                    answer = propObj.next_date_supported;
            }

        }
        var result = this.newItem("result");
        result.setAttribute("next_date", answer);
        return result;
    },
    validSourceCheck: function(table, conditionString, dimensionString, aggregatesString, sourceID) {
        var fields = dimensionString.split(",");
        if (aggregatesString) {
            var fieldsToAggregate = aggregatesString.split(",");
            fields = fields.concat(fieldsToAggregate);
        }
        var uniqueFields = [];
        for (var i = 0; i < fields.length; i++) {
            if (uniqueFields.indexOf(fields[i]) < 0) {
                uniqueFields.push(fields[i]);
            }
        }

        //count unique dimensions and aggregates
        if (uniqueFields.length > 250)
            return false;

        var unsupported_fields = new global.PAAnalyticsSourceUtil().unSupportedFields(table, conditionString, dimensionString, aggregatesString, sourceID);
        for (var i = 0; i < unsupported_fields.length; i++) {
            var unsupported_field = unsupported_fields[i];
            if (unsupported_field.value.length > 0)
                return false;

        }

        if (gs.isDatabaseView(table)) {
            var dbViewGR = new GlideRecord('sys_db_view');
            dbViewGR.addQuery('name', table);
            dbViewGR.query();
            if (dbViewGR.next())
                return new global.PAAnalyticsSourceUtil().validDBViewCheck(table, dbViewGR.getValue('sys_id'));

        }

        return true;
    },

    unSupportedFields: function(table, conditionString, dimensionString, aggregatesString, sourceID) {
        var unsupported_fields = [];
	var td = GlideTableDescriptor.get(table);

        //Check table
        var unsupported_table = {};
        unsupported_table.key = "Table";
        unsupported_table.value = [];
        if (SNC.CDCUnsupportedTable.isTableUnsupported(table))
            unsupported_table.value.push(table.toString());

        unsupported_fields.push(unsupported_table);

        //Check Excluded table
        var excluded_table_check = {};
        excluded_table_check.key = "ExcludedTable";
        excluded_table_check.value = [];
        if (SNC.CDCExcludedTable.isTableExcluded(table))
            excluded_table_check.value.push(table.toString());

        unsupported_fields.push(excluded_table_check);

        //Check condition builder
        var conditionFields = [];
        var queryString = new GlideQueryString(table, conditionString);
        queryString.deserialize();
        var terms = queryString.getTerms();
        for (var j = 0; j < terms.size(); j++) {
            var term = terms.get(j);
            if (gs.nil(term))
                continue;

            var conditionField = term.getField();
            if (gs.nil(conditionField))
                continue;

            conditionFields.push(String(conditionField));
        }

        var unsupported_condition_field = {};
        unsupported_condition_field.key = "Conditions";
        unsupported_condition_field.value = [];
        for (var i = 0; i < conditionFields.length; i++) {
            var cField = conditionFields[i];
            if (cField.indexOf('\.') > 0 && cField !== undefined) {
                var dotWalkedEntries = new global.PAAnalyticsSourceUtil().getDotWalkFields(String(cField));
                var fieldDesc = new global.PAAnalyticsSourceUtil().getLastDotWalkFieldED(table, dotWalkedEntries);
                if (!new global.PAAnalyticsSourceUtil().isFieldSupported(fieldDesc))
                    unsupported_condition_field.value.push(!fieldDesc ? cField : fieldDesc.getLabel());
                else
                    continue;
            } else {
                var fieldDesc = td.getElementDescriptor(cField);
                if (!new global.PAAnalyticsSourceUtil().isFieldSupported(fieldDesc))
                    unsupported_condition_field.value.push(!fieldDesc ? cField : fieldDesc.getLabel());
            }
        }
        unsupported_fields.push(unsupported_condition_field);

        //Check dimension selector
        var unsupported_dimension_field = {};
        unsupported_dimension_field.key = "Dimensions";
        unsupported_dimension_field.value = [];
        var dimensions = dimensionString.split(",");
        for (var i = 0; i < dimensions.length; i++) {
            var dField = dimensions[i];
            if (dField.indexOf('\.') > 0) {
                var dotWalkedEntries = new global.PAAnalyticsSourceUtil().getDotWalkFields(dField);
                var dFieldDesc = new global.PAAnalyticsSourceUtil().getLastDotWalkFieldED(table, dotWalkedEntries);
                if (!new global.PAAnalyticsSourceUtil().isFieldSupported(dFieldDesc))
                    unsupported_dimension_field.value.push(dField);
                else
                    continue;
            } else {
                var dFieldDesc = td.getElementDescriptor(dField);
                if (!new global.PAAnalyticsSourceUtil().isFieldSupported(dFieldDesc))
                    unsupported_dimension_field.value.push(!dFieldDesc ? dField : dFieldDesc.getLabel());
            }
        }
        unsupported_fields.push(unsupported_dimension_field);

        // checks if any field(dimension or aggregate) is removed
        var unsupported_field_removed = {};
        unsupported_field_removed.key = "Fields Removed";
        unsupported_field_removed.value = [];
        var fieldsToAggregate = aggregatesString.split(",");
        var allFields = dimensions.concat(fieldsToAggregate);
        allFields = allFields.concat(conditionFields);
        var gr = new GlideRecord("pa_cdc_dimension_columns");
        gr.addQuery("analytics_source", sourceID);
        gr.query();
        while (gr.next()) {
            var dimension = gr.getValue('dimension');
            var dimensionDesc = td.getLastElementDescriptor(dimension);
            if (allFields.indexOf(dimension) == -1) {
                unsupported_field_removed.value.push(!dimensionDesc ? dimension : dimensionDesc.getLabel());
            }
        }
        unsupported_fields.push(unsupported_field_removed);

        //Check aggregate selector
        var unsupported_aggregate_field = {};
        unsupported_aggregate_field.key = "Aggregates";
        unsupported_aggregate_field.value = [];
        if (aggregatesString) {
            for (var k = 0; k < fieldsToAggregate.length; k++) {
                var aField = fieldsToAggregate[k];
                if (aField.indexOf('\.') > 0) {
                    var dotWalkedEntries = new global.PAAnalyticsSourceUtil().getDotWalkFields(String(aField));
                    var aFieldDesc = new global.PAAnalyticsSourceUtil().getLastDotWalkFieldED(table, dotWalkedEntries);
                    if (!new global.PAAnalyticsSourceUtil().isFieldSupported(aFieldDesc))
                        unsupported_aggregate_field.value.push(!aFieldDesc ? aField : aFieldDesc.getLabel());
                    else
                        continue;
                } else {
                    var aFieldDesc = td.getElementDescriptor(aField);
                    if (!new global.PAAnalyticsSourceUtil().isFieldSupported(aFieldDesc))
                        unsupported_aggregate_field.value.push(!aFieldDesc ? aField : aFieldDesc.getLabel());
                }
            }
        }
        unsupported_fields.push(unsupported_aggregate_field);

        return unsupported_fields;
    },

    isFieldSupported: function(fieldDesc) {
        var supported_fields = [];
        gr = new GlideRecord("pa_cdc_supported_fields");
        gr.query();
        while (gr.next()) {
            supported_fields.push(gr.getValue('field'));
        }
        if (fieldDesc && fieldDesc.isChoiceTable())
            return supported_fields.indexOf('choice_table') > -1;
        for (var i = 0; i < supported_fields.length; i++) {
            if (fieldDesc && fieldDesc.getInternalType().equals(supported_fields[i]))
                return true;
        }
        return false;
    },


    getDotWalkFields: function(dotWalkString) {
        if (!dotWalkString)
            return [];

        var dotWalkSplit = String(dotWalkString).split('.');
        var dotWalkFields = [];
        var prevValue = '';
        for (var i = 0; i < dotWalkSplit.length; i++) {
            var part = dotWalkSplit[i];

            if (part.indexOf('ref_') === 0) {
                prevValue = prevValue + part + '.';
            } else {
                dotWalkFields.push(prevValue + part);
                prevValue = '';
            }
        }
        return dotWalkFields;
    },

    getLastDotWalkFieldED: function(table, dotWalkedEntries) {
        var gtd = GlideTableDescriptor.get(table);
        var tempTable = table;
        var dotWalkEntry = '';
        var ed = null;

        for (var i = 0; i < dotWalkedEntries.length; i++) {
            dotWalkEntry = dotWalkedEntries[i];

            if (typeof dotWalkEntry === 'string' && dotWalkEntry.indexOf('ref_') === 0) {
                var dotIndex = dotWalkEntry.indexOf('.');
                if (dotIndex < 0) {
                    return null; // Malformed ref_ entry
                }

                var refTable = dotWalkEntry.substring(4, dotIndex);
                var refField = dotWalkEntry.substring(dotIndex + 1);

                gtd = GlideTableDescriptor.get(refTable);
                if (!gtd)
                    return null;

                tempTable = refTable;
                ed = gtd.getElementDescriptor(refField);
                if (!ed)
                    return null;

            } else {
                ed = gtd.getElementDescriptor(dotWalkEntry);
                if (!ed)
                    return null;
            }

            if (i != dotWalkedEntries.length - 1) {
                if (ed.isReference && ed.isReference()) {
                    tempTable = ed.getReference();
                    if (!tempTable)
                        return null;
                    gtd = GlideTableDescriptor.get(tempTable);
                } else {
                    tempTable = tempTable;
                }
            }
        }

        return ed;
    },

    validDBViewCheck: function(table, viewSysId) {
        var regex = new RegExp('^[\(]*[A-Za-z0-9_.]+\\s*[<>=!]+\\s*\'*\"*[A-Za-z0-9_.]+\'*\"*[\)]*$');

        var viewGR = new GlideRecord('sys_db_view');
        viewGR.addQuery('sys_id', viewSysId);
        viewGR.query();
        var view;
        if (viewGR.next())
            view = viewGR.getValue('name');

        var gr = new GlideRecord('sys_db_view_table');
        gr.addQuery('view', viewSysId);
        gr.query();
        while (gr.next()) {
            var whereClause = gr.getValue('where_clause');
            if (whereClause) {
                var matches = whereClause.match(regex);
                if (matches) {
                    var fields = whereClause.replace(/[()]+/g, "").split(/[<>=!]+/);
                    var td = GlideTableDescriptor.get(view);
                    if (td.isValid()) {
                        for (var i = 0; i < fields.length; i++) {
                            var fieldStr = fields[i].match(/\./g) ? fields[i].replace(".", "_").trim() : fields[i].trim();
                            if (fieldStr.startsWith('\'') || fieldStr.startsWith('\"') || /^\d+$/.test(fieldStr))
                                continue;

                            var ed = td.getElementDescriptor(fieldStr);
                            if (!ed)
                                return false;

                            if (ed && !(ed.isReference() || ed.isString() || ed.getInternalType().equals('document_id') || fieldStr.contains("sys_id")))
                                return false;
                        }
                        continue;
                    } else
                        return false;
                } else
                    return false;
            }
            continue;
        }

        return true;
    },
    isIntegerField: function(fieldDesc) {
        return fieldDesc.getType() == 4;
    },
    checkTableUniqueness: function(tableName, currentSysId) {
        if (gs.nil(tableName))
            tableName = this.getParameter('sysparm_table_name');

        if (gs.nil(currentSysId))
            currentSysId = this.getParameter('sysparm_current_sys_id');

        if (gs.nil(tableName))
            return false;

        var gr = new GlideRecord('pa_dm_analytics_source');
        gr.addQuery('table', tableName);
        gr.addQuery('is_hierarchy', false);

        if (!gs.nil(currentSysId))
            gr.addQuery('sys_id', '!=', currentSysId);

        gr.setLimit(1);
        gr.query();

        return (!gr.hasNext()).toString();
    },

    type: 'PAAnalyticsSourceUtil'
});
