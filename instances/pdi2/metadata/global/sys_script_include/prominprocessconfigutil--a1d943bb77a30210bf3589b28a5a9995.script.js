var ProminProcessConfigUtil = Class.create();
ProminProcessConfigUtil.prototype = {
    initialize: function() {},

    isFieldCountValid: function(fields, limit) {
        if (!gs.nil(fields) && fields.split(",").length > limit) {
            return false;
        }
        return true;
    },
    getDuplicateProcessConfig: function(table, processConfigId, contentPack) {
        var grProcessConfig = new GlideRecord("promin_process_def");
        grProcessConfig.addQuery('table', table);
        grProcessConfig.addQuery('sys_id', '!=', processConfigId);
        grProcessConfig.addQuery('content_pack', contentPack);
        grProcessConfig.setLimit(1);
        grProcessConfig.query();
        if (grProcessConfig.next()) {
            return grProcessConfig.getLink();
        }
        return "";
    },
    getDuplicateKPICategory: function(processConfigId, sysId, category) {
        var grKpiCategory = new GlideRecord("promin_process_category_kpi");
        grKpiCategory.addQuery('process_def', processConfigId);
        grKpiCategory.addQuery('category', category);
        grKpiCategory.addQuery('sys_id', '!=', sysId);
        grKpiCategory.setLimit(1);
        grKpiCategory.query();
        if (grKpiCategory.next()) {
            return grKpiCategory.getLink();
        }
        return "";
    },
    isActivityFieldDuplicate: function(processDef, field, viewId) {
        var processGr = new GlideRecord("promin_view_field_config");
        processGr.addQuery("process_def", processDef);
        processGr.addQuery("field", field);
        processGr.addQuery("sys_id", '!=', viewId);
        processGr.addQuery("view", '!=', 'OTHER');
        processGr.query();
        return processGr.hasNext();
    },
    isPerspectiveFieldLimitValid: function(processDef, view) {
        var limit = this._getFieldLimit(view);
        var processGa = new GlideAggregate("promin_view_field_config");
        processGa.addQuery("process_def", processDef);
        processGa.addQuery("view", view);
        processGa.addAggregate("COUNT", null);
        processGa.query();
        if (processGa.next()) {
            var countOfFields = parseInt(processGa.getAggregate("COUNT", null));
            return countOfFields < limit;
        }
        return true;
    },
    isWorkNotesTimeRangeValid: function(timeRange) {
        if (parseInt(timeRange) < 0 || parseInt(timeRange) > 300) {
            return false;
        }
        return true;
    },
    isWorkNotesFieldValid: function(table, field) {
        var grTable = new GlideRecord(table);
        if (gs.nil(field)) {
            return true;
        }
        if (grTable.isValidField(field)) {
            var glideElement = grTable.getElement(field);
            var descriptor = glideElement.getED();
            var type = descriptor.getInternalType();
            return type == "journal_input" || type == "journal";
        }
        return false;
    },
    isDotWalkLevelValid: function(breakdownField) {
        if (breakdownField.contains(".")) {
            var limit = gs.getProperty("promin.limit.breakdown_dot_walk", 3);
            var fields = breakdownField.split(".");
            var levels = fields.length;
            if (levels > parseInt(limit)) {
                return false;
            }
        }
        return true;
    },
    _getFieldLimit: function(view) {
        if (view == "CONTROL_FLOW" || view == "RESOURCE_USER" || view == "RESOURCE_GROUP") {
            return 1;
        } else {
            return 10;
        }
    },

    getDuplicateChildConfig: function(processDefId, table, sourceField, filter) {
        var grChildConfig = new GlideRecord("promin_child_table_config");
        grChildConfig.addQuery('process_def', processDefId);
        grChildConfig.addQuery('table', table);
        grChildConfig.addQuery('source_field', sourceField);
        grChildConfig.addQuery('filter', filter);
        grChildConfig.setLimit(1);
        grChildConfig.query();
        if (grChildConfig.next()) {
            return grChildConfig.getLink();
        }
        return "";
    },

    deleteProcessKPICategory: function(processId, payload) {
        try {
            if (payload.impactedKpis.length === 0) {
                var gr = new GlideRecordSecure("promin_process_category_kpi");
                gr.get(payload.id);
                var isDeleted = gr.deleteRecord();
                return {
                    success: isDeleted,
                    message: isDeleted ? gs.getMessage('Category deleted successfully.') : gs.getMessage('Error occured while deleting the KPI.')
                };
            }
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Error occured while deleting the KPI.'),
            };
        }
    },

    getProcessKPICategoryChoices: function(sysparm_query) {
        try {
            var gr = new GlideRecord("sys_choice");
            gr.addEncodedQuery(sysparm_query);
			gr.orderBy('sequence');
            gr.query();
            var data = [];
            while (gr.next()) {
                data.push({
                    label: gr.getDisplayValue("label"),
                    value: gr.getDisplayValue("value"),
                    hint: gr.getDisplayValue("hint")
                });
            }
            return {
                success: true,
                message: "",
                result: data,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage("Error occured while reading the KPI category choices"),
                result: [],
            };
        }
    },
    deleteControlFlowValueMapping: function(processDef) {
        var controlFlowGr = new GlideRecord("promin_control_flow_mapping");
        controlFlowGr.addQuery("process_def", processDef);
        controlFlowGr.query();
        while (controlFlowGr.next()) {
            controlFlowGr.deleteRecord();
        }
    },
    isControlFlowCategoryDuplicate: function(processDef, category) {
        var controlFlowGr = new GlideRecord("promin_control_flow_mapping");
	controlFlowGr.addQuery("process_def", processDef);
	controlFlowGr.addQuery("category", category);
        controlFlowGr.query();
	return controlFlowGr.next();
    },

    type: 'ProminProcessConfigUtil'
};
