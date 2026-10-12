function transform() {

    if (!(gs.hasRole('knowledge_admin') || gs.hasRole('knowledge_manager'))) {
        return []; // Ineligible session: don't run the action_strategy-gated query at all
    }

    var skillConfigApi = new sn_nowassist_admin.NowAssistSkillConfig();
    var GROUPING_CAPABILITY_ID = '1d8ba13e773302103f075cea5b5a9931';
    
    var itsmSkillConfigStatus = skillConfigApi.getSkillConfigurationWithBaseTableFallback(GROUPING_CAPABILITY_ID, {"skill_name":'itsm'}) || {};
    var csmSkillConfigStatus = skillConfigApi.getSkillConfigurationWithBaseTableFallback(GROUPING_CAPABILITY_ID, {"skill_name":'csm'}) || {};

    var hrSkillConfigStatus = skillConfigApi.getSkillConfigurationWithBaseTableFallback(GROUPING_CAPABILITY_ID, {"skill_name":'hr'}) || {};

    var skillConfigStatuses = {};
    if (itsmSkillConfigStatus.sys_id) {
        skillConfigStatuses[itsmSkillConfigStatus.sys_id] = itsmSkillConfigStatus.active || false;
    }
    if (csmSkillConfigStatus.sys_id) {
        skillConfigStatuses[csmSkillConfigStatus.sys_id] = csmSkillConfigStatus.active || false;
    }
    if (hrSkillConfigStatus.sys_id) {
        skillConfigStatuses[hrSkillConfigStatus.sys_id] = hrSkillConfigStatus.active || false;
    }

    // Fetch Knowledge Gaps Task Type Data
    var gapGA = new GlideAggregate("kb_gap_candidates");
    gapGA.addNotNullQuery("task");
    gapGA.addQuery("action_strategy.active", true);
    gapGA.addQuery("gap_status", "!=", "resolved");
    gapGA.addQuery("group_descriptionINjavascript: new sn_km_gen_ai.KnowledgeGap().filterUnaryClusters()");
    gapGA.groupBy('task.sys_class_name');
    gapGA.groupBy('group_id');
    gapGA.query();

    var taskGroupMap = {
        incident: { label: gs.getMessage('Incidents') },
        sn_customerservice_case: { label: gs.getMessage('CSM Cases') },
        sn_hr_core_case: { label: gs.getMessage('HR Cases') }
    };

    var incidentTable = new GlideRecordSecure("incident");
    var isITSMActive = GlidePluginManager.isActive("com.sn.itsm.gen.ai");
    taskGroupMap.incident.groups = new Set();
    taskGroupMap.incident.canRead = incidentTable.canRead();
    taskGroupMap.incident.isPluginActive = isITSMActive;
    taskGroupMap.incident.skillConfigId = itsmSkillConfigStatus.sys_id || null;

    var caseTable = new GlideRecordSecure("sn_customerservice_case");
    var isCSMActive = GlidePluginManager.isActive("com.sn.csm.gen.ai");
    taskGroupMap.sn_customerservice_case.groups = new Set();
    taskGroupMap.sn_customerservice_case.canRead = caseTable.canRead();
    taskGroupMap.sn_customerservice_case.isPluginActive = isCSMActive;
    taskGroupMap.sn_customerservice_case.skillConfigId = csmSkillConfigStatus.sys_id || null;

    var hrCaseTable = new GlideRecordSecure("sn_hr_core_case");
    var isHRActive = GlidePluginManager.isActive("com.sn_hr_gen_ai");
    taskGroupMap.sn_hr_core_case.groups = new Set();
    taskGroupMap.sn_hr_core_case.canRead = hrCaseTable.canRead();
    taskGroupMap.sn_hr_core_case.isPluginActive = isHRActive;
    taskGroupMap.sn_hr_core_case.skillConfigId = hrSkillConfigStatus.sys_id || null;

    while (gapGA.next()) {
        var taskClass = gapGA.getValue('task.sys_class_name');
        var domainType = null;
        if (taskGroupMap[taskClass]) {
            domainType = taskClass;
        } else {
            // HR/CSM base tables have child tables (e.g. sn_hr_core_case_total_rewards);
            // resolve the gap task's class to its domain via the table hierarchy so subtable
            // records aren't dropped. getTables() returns a Java list, so use indexOf (not [] / .length).
            var ancestors = new GlideTableHierarchy(taskClass).getTables();
            if (ancestors.indexOf('sn_hr_core_case') > -1) {
                domainType = 'sn_hr_core_case';
            } else if (ancestors.indexOf('sn_customerservice_case') > -1) {
                domainType = 'sn_customerservice_case';
            } else if (ancestors.indexOf('incident') > -1) {
                domainType = 'incident';
            }
        }
        if (domainType) {
            taskGroupMap[domainType].groups.add(gapGA.getValue('group_id'));
        }
    }

    var results = [];

    for (var type in taskGroupMap) {
        var configId = taskGroupMap[type].skillConfigId;
        var isSkillActive = (configId && skillConfigStatuses[configId] === true) ? true : false;

        var taskData = {
            id: type,
            label: taskGroupMap[type].label,
            gapSize: (isSkillActive && taskGroupMap[type].canRead) ? taskGroupMap[type].groups.size : -1,
            canRead: taskGroupMap[type].canRead,
            isGenAIPluginActive: taskGroupMap[type].isPluginActive,
            isSkillActive: isSkillActive
        };

        results.push(taskData);
    }

    // Fixed display order: Incidents, CSM Cases, HR Cases (not gap-size ranked).
    var TASK_TYPE_ORDER = ['incident', 'sn_customerservice_case', 'sn_hr_core_case'];
    results.sort(function(a, b) {
        return TASK_TYPE_ORDER.indexOf(a.id) - TASK_TYPE_ORDER.indexOf(b.id);
    });

    return results;
}
