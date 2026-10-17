function transform(input) {
    var table = input.table;
    var sysId = input.sysId;
    var gr;
    var routeObj = {};
    var util = new CMDBWorkspaceUtil();
    var DM = new CMDBWsDMConstants();
    var isExploreCiEnabled = util.getSystemProperty(util.SYS_PROPERTIES_NAME.EXPLORE_CI_RECORD_ENABLED, util.DATATYPE.BOOLEAN, false);

    var TABLES = {
        // data manager
        CMDB_DM_TASK: "cmdb_data_management_task",
        CMDB_DM_POLICY_EXECUTION: "cmdb_data_management_policy_execution",
        CMDB_DM_POLICY: "cmdb_data_management_policy",
        CMDB_DM_RUNTIME_ATTRIBUTES: "cmdb_data_management_policy_runtime_attributes",
        CMDB_DEDUPE_TASK: "reconcile_duplicate_task",


        // multisource tables
        CMDB_MULTISOURCE_DATA: "cmdb_multisource_data",
        SN_CMDB_WS_MS_DISCOVERY_SOURCES_NOT_REPORTING: "sn_cmdb_ws_ms_discovery_sources_not_reporting",
        SN_CMDB_WS_MS_DATA_MISMATCH: "sn_cmdb_ws_ms_data_mismatch",
        SN_CMDB_WS_MS_CIS_WITH_SINGLE_SOURCE: "sn_cmdb_ws_ms_cis_with_single_source",
        SN_CMDB_WS_MS_CIS_BY_NUMBER_OF_SOURCES: "sn_cmdb_ws_ms_cis_by_number_of_sources"
    };

    var ROUTE = {
        LIST: "list",
        DM_POLICY_FORM: 'data-manager-policy-form',
        TASK_DETAILS: 'task-detail',
        DM_POLICY_DETAILS: 'data-manager-policy-details',
        DM_POLICY_EXECUTION_DETAILS: 'data-manager-policy-execution',
        RECORD: 'record',
        MULTISOURCE_PREVIEW: 'cmdb-360-multisource-data-preview',
        DE_DUPE_TASK_DETAILS: 'remediate-duplicate-task',
        CI_RECORD: 'ci-record'
    };

    if (!gs.nil(table) && !gs.nil(sysId)) {
        routeObj = {
            route: '',
            fields: {},
            params: {},
            redirect: false,
            passiveNavigation: false,
            targetRoute: 'current',
            external: {},
            title: ''
        };
        gr = new GlideRecordSecure(table);
        var canWrite = gr.canWrite();
        var canRead = gr.canRead();
        if (gr.get(sysId)) {
            // get the actual sys_id in cases where tables have different reference keys
            sysId = gr.getValue("sys_id");
            if (table == TABLES.CMDB_MULTISOURCE_DATA || table == TABLES.SN_CMDB_WS_MS_DISCOVERY_SOURCES_NOT_REPORTING || table == TABLES.SN_CMDB_WS_MS_DATA_MISMATCH ||
                table == TABLES.SN_CMDB_WS_MS_CIS_WITH_SINGLE_SOURCE || table == TABLES.SN_CMDB_WS_MS_CIS_BY_NUMBER_OF_SOURCES) {
                var ciSysId = gr.getValue('ci');
                var classTable = gr.getValue('class');
                if (ciSysId && classTable) {
                    routeObj.route = ROUTE.MULTISOURCE_PREVIEW;
                    routeObj.fields = {
                        table: classTable,
                        sys_id: ciSysId
                    };
                    return routeObj;
                }
            } else if (table == TABLES.CMDB_DM_TASK && canWrite) {
                //temp workaround for DEF0683182
                //re-route non-certification closed tasks to SRP. Remove this check when task details page is enhanced to support all policy types and for all states
                var closedTaskStates = [DM.TASK.STATE_OPTIONS.CLOSED_COMPLETE, DM.TASK.STATE_OPTIONS.CLOSED_INCOMPLETE, DM.TASK.STATE_OPTIONS.CLOSED_SKIPPED, DM.TASK.STATE_OPTIONS.CLOSED_CANCELLED];
                var currPolicyType = gr.policy_id.cmdb_policy_type;
                var currState = parseInt(gr.getValue("state"));
                var isClosedTask = closedTaskStates.includes(currState);
                if (currPolicyType != DM.OOB_POLICY_TYPES.CERTIFICATION.sys_id && isClosedTask) {
                    routeObj.route = ROUTE.RECORD;
                    routeObj.fields = {
                        table: table,
                        sysId: sysId
                    };
                } else {
                    routeObj.route = ROUTE.TASK_DETAILS;
                    routeObj.fields = {
                        sysId: sysId
                   };
				}
            } else if ((table == TABLES.CMDB_DM_POLICY || table == TABLES.CMDB_DM_RUNTIME_ATTRIBUTES) && canWrite) {
                routeObj.route = ROUTE.DM_POLICY_DETAILS;
                routeObj.fields = {
                    policyRuntimeAttributesSysId: sysId
                };
            } else if (table == TABLES.CMDB_DM_POLICY_EXECUTION && canRead) {
                routeObj.route = ROUTE.DM_POLICY_EXECUTION_DETAILS;
                routeObj.fields = {
                    sysId: sysId
                };
            } else if (table == TABLES.CMDB_DEDUPE_TASK && canRead) {
                routeObj.route = ROUTE.DE_DUPE_TASK_DETAILS;
                routeObj.fields = {
                    table: table,
                    sysId: sysId
                };
            } else { // catch all for all reference links
                routeObj.route = util.isCMDBTable(table) && isExploreCiEnabled ? ROUTE.CI_RECORD : ROUTE.RECORD;
                routeObj.fields = {
                    table: table,
                    sysId: sysId
                };
            }
            routeObj.title = gr.getDisplayValue();
        } else { //catch all, even if gr.get(sysId) returned false. 
            routeObj.route = ROUTE.RECORD;
            routeObj.fields = {
                table: table,
                sysId: sysId
            };
        }
    }

    return routeObj;
}
