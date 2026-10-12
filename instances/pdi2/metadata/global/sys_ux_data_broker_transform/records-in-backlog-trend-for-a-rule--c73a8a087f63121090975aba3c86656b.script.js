function transform(input) {
    var ruleId = input.ruleId;
    var tableName = input.tableName;
    var ruleType = input.ruleType;

    const MONTH = "month";
    const DAY = "day";

    if (ruleId && tableName && ruleType) {
        var ruleFilter = new sn_data_management_rule_backlog.DmRuleFilter();
        ruleFilter.setRuleFilter(ruleId, ruleType);
        var rulesAPI = new sn_data_management_rule_backlog.DmRuleBacklogApi();

        var monthlyBacklogs = [];
        try {
            monthlyBacklogs = fetchMonthlyRecords();
        } catch (error) {
            gs.log("Unable to fetch monthly backlogs with error: " + error.message);
        }
        var latestBacklog = null;
        try {
            latestBacklog = fetchLatestDailyBacklog();
        } catch (error) {
            gs.log("Unable to fetch daily backlogs with error: " + error.message);
        }

        return mergeBacklogRecords(monthlyBacklogs, latestBacklog);
    }
    return [];

    function fetchLatestDailyBacklog() {
        const DAILY_RECORD_COUNT = 30;
        const OFFSET = 0;
        var startDate = new GlideDateTime().getDate();
        startDate.addDaysUTC(-DAILY_RECORD_COUNT);
        var dailyResponse = JSON.parse(rulesAPI.getDmRulesLatestBacklog([tableName], ruleFilter, [], startDate.getValue(), OFFSET, DAILY_RECORD_COUNT));
        if (dailyResponse.rules.length == 0) return null;
        var latestDailyBacklog = dailyResponse.rules[0];

        var timestamp = new GlideDateTime(latestDailyBacklog.periodDate).getNumericValue();
        var latestBacklog = {
            timestamp: timestamp,
            value: latestDailyBacklog.backlogCount
        };
        return latestBacklog;
    }

    function fetchMonthlyRecords() {
        var gd = new GlideDateTime().getDate();
        gd.addMonthsUTC(-12);
        var monthlyResponse = JSON.parse(rulesAPI.getDmRulesBacklogTrend([tableName], ruleFilter, [], [MONTH], gd.getValue()));
        var monthlyBacklogs =
            monthlyResponse.dmRuleBacklogTrendByPeriodType[MONTH].dmRuleTrendByRuleType[ruleType].dmRuleTrendByTable[tableName].dmRuleTrendByRule[ruleId].map(item => ({
                timestamp: item.timestamp,
                value: item.backlog
            }));
        monthlyBacklogs.sort((a, b) => a.timestamp - b.timestamp);
        monthlyBacklogs = monthlyBacklogs.slice(-12);
        return monthlyBacklogs;
    }

    function mergeBacklogRecords(monthlyBacklogs, latestBacklog) {
        if (monthlyBacklogs.length == 0) {
            return {
                count: latestBacklog.value,
                trend: [latestBacklog]
            };
        }
        if (latestBacklog === null) {
            return {
                count: null,
                trend: monthlyBacklogs
            };
        }
        var numberOfBacklogs = monthlyBacklogs.length;
        var lastBacklog = monthlyBacklogs[numberOfBacklogs - 1];

        var lastBacklogTime = new GlideDateTime();
        lastBacklogTime.setValue(lastBacklog.timestamp);
        var latestBacklogTime = new GlideDateTime();
        latestBacklogTime.setValue(latestBacklog.timestamp);

        if ((lastBacklogTime.getYearUTC() == latestBacklogTime.getYearUTC()) && (lastBacklogTime.getMonthUTC() == latestBacklogTime.getMonthUTC())) {
            monthlyBacklogs.pop();
        }
        monthlyBacklogs.push(latestBacklog);
        monthlyBacklogs = monthlyBacklogs.slice(-12);
        return {
            count: latestBacklog,
            trend: monthlyBacklogs
        };
    }
}
