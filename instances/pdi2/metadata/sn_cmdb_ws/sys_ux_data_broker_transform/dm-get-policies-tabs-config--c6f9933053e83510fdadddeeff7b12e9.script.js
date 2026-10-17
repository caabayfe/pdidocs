function transform(input) {
    var DM = new CMDBWsDMConstants();
    var WS = new CMDBWsConstants();

    var PUBLISHED_POLICIES = sn_i18n.Message.getMessage('sn_cmdb_ws', 'Published policies');
    var DRAFT_POLICIES = sn_i18n.Message.getMessage('sn_cmdb_ws', 'Draft policies');
    var DEACTIVATED_POLICIES = sn_i18n.Message.getMessage('sn_cmdb_ws', 'De-activated policies');
    var POLICIES_FAILING_EVALUATION = sn_i18n.Message.getMessage('sn_cmdb_ws', 'Policies failing evaluation');
    var EXCLUDE_OOB_DEPENDENT_POLICY_TYPE_FILTER = "" + DM.RUNTIME_ATTRIBUTE.POLICY + "." + DM.CMDB_POLICY_TYPE_CATEGORIES.CMDB_POLICY_TYPE + "!=" + DM.OOB_POLICY_TYPES.DEPENDENT_CI_ARCHIVE.sys_id + "^" + 
    DM.RUNTIME_ATTRIBUTE.POLICY + "." + DM.CMDB_POLICY_TYPE_CATEGORIES.CMDB_POLICY_TYPE + "!=" + DM.OOB_POLICY_TYPES.DEPENDENT_CI_DELETION.sys_id + "^" +
    DM.RUNTIME_ATTRIBUTE.POLICY + "." + DM.CMDB_POLICY_TYPE_CATEGORIES.CMDB_POLICY_TYPE + "!=" + DM.OOB_POLICY_TYPES.DEPENDENT_CI_RETIRE.sys_id + "";
    var ACTION_CONFIG = {
        DM_DRAFT_DEACTIVATED_POLICY_ACTIONS: '66e3c307531731101152ddeeff7b12fa'
    };

    var TAB_CONFIGS = {
        'PUBLISHED_POLICIES_TAB': {
            label: PUBLISHED_POLICIES,
            fields: {
                fixedFilter: DM.RUNTIME_ATTRIBUTE.STATUS + "=" + DM.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.PUBLISHED + "^" + EXCLUDE_OOB_DEPENDENT_POLICY_TYPE_FILTER,
                hideVisContainer: false,
                view: 'cmdb_ws_published_policies',
                listTitle: PUBLISHED_POLICIES,
                table: DM.RUNTIME_ATTRIBUTE.TABLE,
                hideSelectAllOption: true,
                actionConfig: ""
            }
        },
        'DRAFT_POLICIES_TAB': {
            label: DRAFT_POLICIES,
            fields: {
                fixedFilter: DM.RUNTIME_ATTRIBUTE.STATUS + "=" + DM.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.DRAFT + "^" + EXCLUDE_OOB_DEPENDENT_POLICY_TYPE_FILTER,
                hideVisContainer: true,
                view: 'cmdb_ws_draft_policies',
                listTitle: DRAFT_POLICIES,
                table: DM.RUNTIME_ATTRIBUTE.TABLE,
                query: "ORDERBYDESC" + DM.RUNTIME_ATTRIBUTE.POLICY + '.sys_created_on',
                hideSelectAllOption: false,
                actionConfig: ACTION_CONFIG.DM_DRAFT_DEACTIVATED_POLICY_ACTIONS
            }
        },
        'DEACTIVATED_POLICIES_TAB': {
            label: DEACTIVATED_POLICIES,
            fields: {
                fixedFilter: DM.RUNTIME_ATTRIBUTE.STATUS + "=" + DM.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.INACTIVE + "^" + EXCLUDE_OOB_DEPENDENT_POLICY_TYPE_FILTER,
                hideVisContainer: true,
                view: 'cmdb_ws_deactivated_policies',
                listTitle: DEACTIVATED_POLICIES,
                table: DM.RUNTIME_ATTRIBUTE.TABLE,
                hideSelectAllOption: false,
                actionConfig: ACTION_CONFIG.DM_DRAFT_DEACTIVATED_POLICY_ACTIONS
            }
        },
        'FAILING_EVALUATION_TAB': {
            label: POLICIES_FAILING_EVALUATION,
            fields: {
                view: 'cmdb_ws',
                hideVisContainer: true,
                listTitle: POLICIES_FAILING_EVALUATION,
                table: DM.POLICY_FAILING_EVALUATION.TABLE,
                hideSelectAllOption: true,
                actionConfig: ""
            }
        }
    };

    var result = [];

    Object.keys(TAB_CONFIGS).forEach(function(key) {
        var obj = TAB_CONFIGS[key];
        var count = 0;
        var ga = new GlideAggregate(obj.fields.table);
        ga.addEncodedQuery(obj.fields.fixedFilter, true);
        ga.addAggregate(WS.COUNT_AGGREGATE);
        ga.query();
        if (ga.next()) {
            count = ga.getAggregate(WS.COUNT_AGGREGATE);
            if (count > 0)
                obj.count = count;
        }
        result.push(obj);
    });

    return result;
}
