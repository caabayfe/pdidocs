(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Constants
    var SKILL_CONFIG_TABLE = 'sn_nowassist_skill_config_var_set';
    var SKILL_CONFIG_STATUS_TABLE = 'sn_nowassist_skill_config_status';
    var VARIABLE_VALUE_TABLE = 'sys_variable_value';
    var TABLE_VARIABLE_SYS_ID = '6cfff3bf939d92104d0a423b928918f6';
    var FILTER_TABLE_VALUE = 'par_dashboard';

    var skillConfigs = [];

    // Step 1: Find all variable set records where the Table variable = 'par_dashboard'
    var variableSetSysIds = getVariableSetSysIds();

    // Step 2: Get skill config details from the variable set records
    if (variableSetSysIds.length > 0) {
        skillConfigs = getSkillConfigDetails(variableSetSysIds);
        skillConfigs = getSkillConfigStatus(skillConfigs);
    }

    // Return response
    response.setStatus(200);
    response.setBody({
        skill_configs: skillConfigs
    });

    function getVariableSetSysIds() {
        var sysIds = [];
        var gr = new GlideRecord(VARIABLE_VALUE_TABLE);
        gr.addQuery('document', SKILL_CONFIG_TABLE);
        gr.addQuery('variable', TABLE_VARIABLE_SYS_ID);
        gr.addQuery('value', FILTER_TABLE_VALUE);
        gr.query();

        while (gr.next()) {
            sysIds.push(gr.getValue('document_key'));
        }

        return sysIds;
    }

    function getSkillConfigDetails(variableSetSysIds) {
        var configs = [];
        var gr = new GlideRecord(SKILL_CONFIG_TABLE);
        gr.addQuery('sys_id', 'IN', variableSetSysIds.join(','));
        gr.query();

        while (gr.next()) {
            var skillConfigSysId = gr.getValue('skill_config');

            if (skillConfigSysId) {
                configs.push(skillConfigSysId);
            }
        }

        return configs;
    }

    function getSkillConfigStatus(skillConfigs) {
        var configs = [];
        var gr = new GlideRecord(SKILL_CONFIG_STATUS_TABLE);
        gr.addQuery('skill_config', 'IN', skillConfigs.join(','));
        gr.query();
        var utils = new global.WWNAGlobalUtils();

        while (gr.next()) {
            var skillConfigSysId = gr.getValue('skill_config');

            if (skillConfigSysId) {
                configs.push({
                    sys_id: skillConfigSysId,
                    display_value: gr.getDisplayValue('skill_config'),
                    is_active: gr.getValue('active'),
                    is_in_product_active: gr.getValue('in_product_active'),
                    has_access: utils.hasAccessToSkill(skillConfigSysId, "f8fdd6ca43520210fbb28b11afb8f226", sn_wwna.WWNAConstants.WWNA_DEFAULT_SKILL_CONFIG_ID)
                });
            }
        }

        return configs;
    }

})(request, response);
