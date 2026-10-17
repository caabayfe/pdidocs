function transform(input) {
    const ATTACHMENT = 'sys_attachment';
    const ATTACHMENT_DOC = 'sys_attachment_doc';
    const ATTACHMENT_DOC_V2 = 'sys_attachment_doc_v2';

    var tableName = input.tableName;
    var tableNames = [tableName];
    if (tableName == ATTACHMENT) {
        tableNames.push(ATTACHMENT_DOC, ATTACHMENT_DOC_V2);
    }

    var filter = new sn_data_management_rule_backlog.DmRuleExecutionFilter();
    filter.setTableNames(tableNames);
    filter.setRuleTypes(['TABLE_CLEANER', 'ARCHIVE', 'ONE_TIME_DELETE']);

    // Get only 7 days of execution history
    var startDate = new GlideDate();
    startDate.addDaysUTC(-7);
    filter.setPeriodStartDate(startDate.getValue());

    // load all execution history.
    filter.setLimit(10000);

    var rulesExecutionApi = new sn_data_management_rule_backlog.DmRuleExecutionApi();
    var response = JSON.parse(rulesExecutionApi.getDmRuleExecutions(filter));

    var rulesAPI = new sn_data_management_console.RulesAPI(); 
	var ruleDetails = JSON.parse(rulesAPI.getRules(tableName, ['TABLE_CLEANER', 'ARCHIVE', 'ONE_TIME_DELETE']));

    if (response.responseMetadata.status !== 'SUCCESS')
        return [];


    function getRuleName(ruleSysId) { 
        const rule = ruleDetails.filter(rule => rule.sysId == ruleSysId)[0];
        if (rule.name && rule.name.trim().length > 0) {
            return rule.name;
        }
        if (rule.type == "TABLE_CLEANER") {
            return rule.tableName;
        }
        return rule.number;
    }

    function timeAgo(epochTime) {
        const now = Date.now() / 1000; // Current time in seconds
        const secondsElapsed = now - epochTime;

        if (secondsElapsed < 60)
            return {value: Math.floor(secondsElapsed), unit:"sec"};

        if (secondsElapsed < 3600)
            return {value: Math.floor(secondsElapsed / 60), unit: "min"};

        if (secondsElapsed < 86400)
            return {value: Math.floor(secondsElapsed / 3600), unit: "hr"};

        return {value: Math.floor(secondsElapsed / 86400), unit: "day"};
    }

    function getIcon(ruleType) {
        if (ruleType == 'ARCHIVE')
            return "inbox-archive-fill";

        return "trash-fill";
    }

    return response.executions.map(execution => {
        return {
            ruleId: execution.ruleSysId,
            ruleName: getRuleName(execution.ruleSysId),
            ruleType: execution.ruleType,
            icon: getIcon(execution.ruleType),
            recordsImpacted: execution.recordCount,
            time: timeAgo(execution.endDate / 1000)
        };
    });
}
