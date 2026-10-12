var CMDBIREOutputComparisonApiUtil = Class.create();
CMDBIREOutputComparisonApiUtil.prototype = {
    initialize: function() {
        this._DISABLED = "disabled";
        this._ENABLED = "enabled";
        this._NONE = "none";
        this._DYNAMIC_IRE_AUTO_COMPARE_PROPERTY = "glide.identification_engine.dynamic_ire.auto_compare";
        this._DYNAMIC_IRE_ENABLED_PROPERTY = "glide.identification_engine.dynamic_ire_enabled";
        this._IRE_STATS_ENABLED = "glide.identification_engine.ire_stats.enabled";
        this._SYS_IRE_PATTERN = "sys_ire_pattern";
        this._TOTAL_PATTERN = "IdentificationEngineComparison::totalItemsEvaluated";
        this._NOT_MATCHED_PATTERN = "IdentificationEngineComparison::itemsNotMatched";
        this._SN_CMDB_USER = "sn_cmdb_user";
        this._SN_CMDB_ADMIN = "sn_cmdb_admin";
        this._CMDB_IRE_OUTPUT_COMPARISON_TABLE = "cmdb_ire_output_comparison_item";
        this._CMDB_ASSIST_PLUGIN_ID = 'com.snc.cmdb.gen.ai';
        this._INTERNAL_NAME = 'internal_name';
        this._SKILL_ID = 'skill_id';
        this._NOW_ASSIST_SKILL_CONFIG = 'sn_nowassist_skill_config';
    },

    getIRESimulationData: function(class_name) {
        var result = {
            dynamic_ire_simulation_type: this._NONE,
            data: {},
            comparison_match_percent: 0
        };
        var isDynamicEngine = GlideProperties.getBoolean(this._DYNAMIC_IRE_ENABLED_PROPERTY, false);
        result.identification_engine_type = isDynamicEngine ? "DYNAMIC" : "STATIC";
        if (this._isAuthorized(this._SN_CMDB_USER)) {
            result.rootDynamicIRETable = this._getRootDynamicIRETable(class_name);
            if (gs.nil(class_name) || gs.nil(result.rootDynamicIRETable) ||
                result.rootDynamicIRETable != class_name || isDynamicEngine) {
                return result;
            }

            var comparisonDisabled = !GlideProperties.getBoolean(this._DYNAMIC_IRE_AUTO_COMPARE_PROPERTY, false);
            if (comparisonDisabled) {
                result.dynamic_ire_simulation_type = this._DISABLED;
                return result;
            }
            result.dynamic_ire_simulation_type = this._ENABLED;
            result.comparison_match_percent = this._getComparisonPercentage();
            this._populateOperationTypeData("static", result.data);
            this._populateOperationTypeData("dynamic", result.data);
            this._populateDuplicateData("static", result.data);
            this._populateDuplicateData("dynamic", result.data);
        }
        return result;
    },

    _populateOperationTypeData: function(operation_type, result) {
        var operationTypes = ["UPDATE", "INSERT", "INSERT_AS_PARTIAL", "INSERT_AS_INCOMPLETE", "UPDATE_WITH_UPGRADE", "UPDATE_WITH_DOWNGRADE", "UPDATE_WITH_SWITCH"];

        if (!result.INSERT) {
            result.INSERT = {};
        }
        if (!result.INSERT_AS_PARTIAL) {
            result.INSERT_AS_PARTIAL = {};
        }
        if (!result.INSERT_AS_INCOMPLETE) {
            result.INSERT_AS_INCOMPLETE = {};
        }
        if (!result.UPDATE) {
            result.UPDATE = {};
        }

        // Set default values for the current operation_type
        var encodedQuery = "^static_ciNSAMEASdynamic_ci^ORstatic_ciISEMPTY^ORdynamic_ciISEMPTY";
        result.INSERT[operation_type] = 0;
        result.INSERT[operation_type + "_url"] = "/cmdb_ire_output_comparison_item_list.do?sysparm_query=" + operation_type + "_operation_type=INSERT" + encodedQuery;
        result.INSERT_AS_PARTIAL[operation_type] = 0;
        result.INSERT_AS_PARTIAL[operation_type + "_url"] = "/cmdb_ire_output_comparison_item_list.do?sysparm_query=" + operation_type + "_operation_type=INSERT_AS_PARTIAL" + encodedQuery;
        result.INSERT_AS_INCOMPLETE[operation_type] = 0;
        result.INSERT_AS_INCOMPLETE[operation_type + "_url"] = "/cmdb_ire_output_comparison_item_list.do?sysparm_query=" + operation_type + "_operation_type=INSERT_AS_INCOMPLETE" + encodedQuery;
        result.UPDATE[operation_type] = 0;
        result.UPDATE[operation_type + "_url"] = "/cmdb_ire_output_comparison_item_list.do?sysparm_query=" + operation_type + "_operation_typeSTARTSWITHUPDATE" + encodedQuery;

        var operationTypeColumn = operation_type == "static" ? "static_operation_type" : "dynamic_operation_type";
        var ga = new GlideAggregate('cmdb_ire_output_comparison_item');
        ga.addEncodedQuery(encodedQuery);
        ga.addAggregate('COUNT');
        ga.groupBy(operationTypeColumn);
        ga.query();

        while (ga.next()) {
            var operationTypeValue = ga.getValue(operationTypeColumn);
            if (operationTypes.includes(operationTypeValue)) {
                var count = parseInt(ga.getAggregate('COUNT'));

                if (operationTypeValue === 'INSERT') {
                    result.INSERT[operation_type] = count;
                } else if (operationTypeValue === 'INSERT_AS_PARTIAL') {
                    result.INSERT_AS_PARTIAL[operation_type] = count;
                } else if (operationTypeValue === 'INSERT_AS_INCOMPLETE') {
                    result.INSERT_AS_INCOMPLETE[operation_type] = count;
                } else if (operationTypeValue.startsWith('UPDATE')) {
                    result.UPDATE[operation_type] += count;
                }
            }
        }
    },

    _getComparisonPercentage: function() {

        var totalEvaluated = 0;
        var totalNotMatched = 0;

        var gr = new GlideRecord(this._SYS_IRE_PATTERN);
        var qc = gr.addQuery("method_name", "STARTSWITH", this._TOTAL_PATTERN);
        qc.addOrCondition("method_name", "STARTSWITH", this._NOT_MATCHED_PATTERN);
        gr.query();
        while (gr.next()) {
            if (!gs.nil(gr.getValue("method_name")) && gr.getValue("method_name").startsWith(this._TOTAL_PATTERN))
                totalEvaluated += parseInt(gr.getValue("ci_count")) || 0;
            if (!gs.nil(gr.getValue("method_name")) && gr.getValue("method_name").startsWith(this._NOT_MATCHED_PATTERN))
                totalNotMatched += parseInt(gr.getValue("ci_count")) || 0;
        }
        if (totalEvaluated == 0) {
            return 0;
        }
        var percentage = ((totalEvaluated - totalNotMatched) / totalEvaluated) * 100;
        return percentage >= 99 ? Math.floor(percentage) : Math.round(percentage);
    },

    _getRootDynamicIRETable: function(class_name) {
        var tableList = new GlideRecordUtil().getTables(class_name);
        var root = null;

        var gr = new GlideRecord('cmdb_dynamic_ire_model');
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            if (tableList.indexOf(gr.getValue('cmdb_class')) > -1) {
                root = gr.getValue('cmdb_class');
                break;
            }
        }

		if(!root)
			return root;

		gr = new GlideRecord('cmdb_dynamic_ire_skip_class');
        gr.addActiveQuery();
        gr.query();
		while(gr.next()) {
			if (tableList.indexOf(gr.getValue('class')) > -1) {
                root = null;
				break;
			}
		}

		if(!root)
			return root;

        //has dependent rule
        var tableArr = [];
        for (var i = 0; i < tableList.size(); i++)
            tableArr.push(tableList.get(i));

        gr = new GlideRecord('cmdb_identifier');
        gr.addActiveQuery();
        gr.addQuery('applies_to', 'IN', tableArr.join(','));
        gr.query();
        var dependent = {};
        while (gr.next())
            dependent[gr.getValue('applies_to')] = gr.getValue('independent') == 0;

        for (var i = 0; i < tableList.size(); i++) {
            if (!dependent.hasOwnProperty(tableList.get(i)))
                continue;

            if (dependent[tableList.get(i)])
                root = null;

            break;
        }
		
		return root;
    },

    _populateDuplicateData: function(operation_type, result) {

        if (!result.DUPLICATE) {
            result.DUPLICATE = {};
        }
        var duplicateColumn = operation_type == 'static' ? 'static_duplicate_ci_count' : 'dynamic_duplicate_ci_count';
        var ciColumn = operation_type == 'static' ? 'static_ci' : 'dynamic_ci';
        var ga = new GlideAggregate(this._CMDB_IRE_OUTPUT_COMPARISON_TABLE);
        ga.addQuery(duplicateColumn, ">", 0);
        ga.addAggregate('COUNT');
        ga.query();
        result.DUPLICATE[operation_type] = ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
        result.DUPLICATE[operation_type + "_url"] = "/cmdb_ire_output_comparison_item_list.do?sysparm_query=" + operation_type + "_duplicate_ci_count>0";

    },

    setDynamicIREProperties: function(property_type) {
        if (!gs.hasRole(this._SN_CMDB_ADMIN)) {
            gs.warn("CMDBIREOutputComparisonApiUtil.setDynamicIREProperties: caller lacks sn_cmdb_admin; refusing to change IRE engine properties.");
            return;
        }
        if (gs.nil(property_type)) {
            return;
        }

        var props = {};
        if (property_type == "ENABLE_DYNAMIC_IRE_SIMULATION") {
            props[this._DYNAMIC_IRE_AUTO_COMPARE_PROPERTY] = true;
            props[this._IRE_STATS_ENABLED] = true;
        } else if (property_type == "DISABLE_DYNAMIC_IRE_SIMULATION") {
            props[this._DYNAMIC_IRE_AUTO_COMPARE_PROPERTY] = false;
            props[this._IRE_STATS_ENABLED] = false;
        } else if (property_type == "ENABLE_STATIC_IRE") {
            props[this._DYNAMIC_IRE_ENABLED_PROPERTY] = false;
        } else if (property_type == "ENABLE_DYNAMIC_IRE") {
            props[this._DYNAMIC_IRE_AUTO_COMPARE_PROPERTY] = false;
            props[this._DYNAMIC_IRE_ENABLED_PROPERTY] = true;
            props[this._IRE_STATS_ENABLED] = false;
        } else
            return false;

        return this._validateSetProperty(props);
    },

    _isAuthorized: function(role) {
        if (gs.hasRole(role))
            return true;

        return false;
    },

    _validateSetProperty: function(props) {
        var success = true;
        var original = {};

        for (var prop in props) {
            var previous = gs.getProperty(prop);
            gs.setProperty(prop, props[prop]);
            success &= gs.getProperty(prop) == '' + props[prop];
            if (!success) break;
            original[prop] = previous;
        }

        if (success) return true;
        for (var prop in original)
            gs.setProperty(prop, original[prop]);

        return false;
    },

    _getSkillInternalName: function(skillId) {
        var gr = new GlideRecord(this._NOW_ASSIST_SKILL_CONFIG);
        gr.addQuery(this._SKILL_ID, skillId);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue(this._INTERNAL_NAME);
        }
        return undefined;
    },

    isSkillActive: function(skillId) {
        var skillInternalName = this._getSkillInternalName(skillId);
        if (!skillInternalName) {
            gs.error("Cannot find internal name for capability " + skillId);
            return false;
        }

        var configUtil = new sn_nowassist_admin.NowAssistSkillConfig();
        return GlidePluginManager.isActive(this._CMDB_ASSIST_PLUGIN_ID) && configUtil.isSkillConfigurationActive(skillId) && gs.hasRightsTo("gen_ai_skill/" + skillInternalName + "/execute");
    },

    type: 'CMDBIREOutputComparisonApiUtil'
};
