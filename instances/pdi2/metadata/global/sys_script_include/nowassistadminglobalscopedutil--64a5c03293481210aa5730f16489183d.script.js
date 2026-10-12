var NowAssistAdminGlobalScopedUtil = Class.create();
NowAssistAdminGlobalScopedUtil.prototype = {
    initialize: function() {
        this.NAA_TABLES = new Set(['sn_nowassist_skill_config', 'sn_nowassist_skill_config_status', 'sn_nowassist_skill_config_applicability', 'sn_ns_config_m2m_skill', 'sn_nowassist_skill_config_var_set', 'sys_gen_ai_skill_applicability', 'sn_ns_skill_config_ui', 'sn_ns_skill_config_var_set_ui', 'sn_ns_provider_configuration', 'sn_ns_provider_configuration_status', 'sn_ns_provider_configuration_llm_mapping', 'sn_ns_manage_llm_change_history', 'sn_nowassist_usage_rules', 'sn_nowassist_usage_rule_execution', 'sn_nowassist_usage_alerts']);
		this.DOMAIN_BYPASS_ALLOWED_TABLES = ['domain', 'sys_gen_ai_usage_log']; // Tables allowed to bypass domain separation for cross-domain queries
    },

    isNAATable: function(tableName) {
        return this.NAA_TABLES.has(tableName);
    },

    _getValuePairsFromClonedRecord: function(table, sysId, fields) {
        try {
            if (!table || !sysId) return {};
            var valuePairs = {};
            var gr = new GlideRecordSecure(table);
            if (gr.get(sysId)) {
                fields.forEach(function(field) {
                    valuePairs[field] = gr.getValue(field);
                });
                return valuePairs;
            }
            return {};
        } catch (e) {
            return {};
        }
    },

    _grRecordCreator: function(table, valuePairs, cloneInfo) {
        try {
            var clonedValuePairs = {},
                field;
            if (cloneInfo && cloneInfo.sys_id && Array.isArray(cloneInfo.fields) && cloneInfo.fields.length > 0) {
                clonedValuePairs = this._getValuePairsFromClonedRecord(table, cloneInfo.sys_id, cloneInfo.fields);
            }
            var gr = new GlideRecordSecure(table);
            gr.initialize();
            for (field in clonedValuePairs) {
                gr[field] = clonedValuePairs[field];
            }
            for (field in valuePairs) {
                gr[field] = valuePairs[field];
            }
            if (gr.canWrite()) {
                return gr.insert();
            } else {
                gs.error("Inserting record failed to perform the operation as the user don't have write accesss " + table);
            }
        } catch (e) {
            return null;
        }
    },

    updateRecord: function(table, sysId, props) {
        var gr = new GlideRecordSecure(table);
        var result = null;
        if (gr.get(sysId)) {
            for (var key in props) {
                gr.setValue(key, props[key]);
            }
            if (gr.canWrite()) {
                result = gr.update();
                if (result) {
                    return result;
                } else {
                    gs.error("Updating record failed to perform the operation");
                }
            } else {
                gs.error("Updating record failed to perform the operation as the user don't have write accesss " + table + " " + sysId);
            }
        }
        return null;
    },

    getRecord: function(table, sysId, props /* Array of fields */ ) {
        var result = {};
        var _self = this;
        try {
            var gr = new GlideRecordSecure(table);
            if (gr.get(sysId)) {
                props.forEach(function(prop) {
                    result[prop] = gr[prop].toString(); //Do not use getValue() as it is showing display value in some cases like incident.category
                    result.__choices = _self._parseChoiceList(GlideScriptChoiceList.getChoiceList(table, prop));
                    result.__display_name = gr.getDisplayValue();
                    result.__internal_type = gr.getElement(prop).getED().getInternalType().toString();
                    result.__canWrite = gr.canWrite();
                    result.__isInSelectedScope = gr.isInSelectedScope();
                });
            }
            return result;
        } catch (e) {
            return result;
        }
    },

    /**
     * add domainGR's domain query to gr.
     */
    addRecordDomainToProcessSeparatedQuery: function(gr, domainGR) {
        if (!gs.nil(gr)) {
            var currTableName = gr.getTableName();
            if (this.isNAATable(currTableName))
                gr.addDomainQuery(domainGR);
        }
    },

    /**
     * remove domain query on gr...
     */
    ignoreDomainOnGr: function(gr) {
        if (!gs.nil(gr)) {
            var currTableName = gr.getTableName();
            if (this.isNAATable(currTableName) || this.DOMAIN_BYPASS_ALLOWED_TABLES.includes(currTableName))
                gr.queryNoDomain();
        }
    },

    deleteFilterRecord: function(table, sysId) {
        try {
            var gr = new GlideRecordSecure(table);
            if (gr.get(sysId))
                if (gr.canDelete())
                    return gr.deleteRecord();
                else
                    gs.error("deleting record failed to perform the operation as the user don't have delete accesss" + e.toString());
            return null;
        } catch (e) {
            gs.error("deleting record failed to perform the operation " + e.toString());
            return null;
        }

    },

    dropColumn: function(tableName, columnName) {
        try {
            gs.dropColumn(tableName, columnName);
            gs.info("NowAssistAdminGlobalScopedUtil: successfully deleted column: " + columnName + " from table: " + tableName);
        } catch (e) {
            gs.error("NowAssistAdminGlobalScopedUtil: deleting column failed to perform the operation " + e.toString());
        }
    },
    updateColumn: function(tableName, columnName, attribute, newValue) {
        if (!this.isNAATable(tableName)) {
            gs.error("The table " + tableName + " is not in sn_nowassist_admin scope");
            return;
        }
        try {
            var gr = new GlideRecordSecure('sys_dictionary');
            var oldValue = '';
            gr.addEncodedQuery('name=' + tableName + '^element=' + columnName);
            gr.query();
            if (gr.next()) {
                oldValue = gr.getValue(attribute);
                gr.setValue(attribute, newValue);
                gr.update();
            }
            gs.info("NowAssistAdminGlobalScopedUtil: Updated the column: " + columnName + " from " + oldValue + " to " + newValue);
        } catch (e) {
            gs.error("failed to update the column " + JSON.stringify(e));
        }
    },

    clearErrorMessages: function() {
        gs.flushMessages();
    },

    trackInUpdateSet: function(gr) {
        var updateManager = new GlideUpdateManager2();
        updateManager.saveRecord(gr);
    },
	
    getReadableQuery: function (tableName, query) {
        return new GlideQueryBreadcrumbs().getReadableQuery(tableName, query);
    },

    type: 'NowAssistAdminGlobalScopedUtil'
};
