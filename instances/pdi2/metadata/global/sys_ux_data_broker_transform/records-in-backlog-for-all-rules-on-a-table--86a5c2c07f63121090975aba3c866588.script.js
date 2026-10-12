function transform(input) {
	var RULES = ["ARCHIVE", "TABLE_CLEANER"];
    var tableName = input.tableName;
    if (tableName != null) {
        var rulesAPIObj = new sn_data_management_console.RulesAPI();
        var aggregatedMonthlyTrends = JSON.parse(rulesAPIObj.getBacklogTrend(tableName, RULES, "month", 12)) || [];
        var aggregatedDailyTrends = JSON.parse(rulesAPIObj.getBacklogTrend(tableName, RULES, "day", 10)) || [];

        var archiveMonthlyTrend = aggregatedMonthlyTrends.find(trend => trend.ruleType == "ARCHIVE");
        var tableCleanerMonthlyTrend = aggregatedMonthlyTrends.find(trend => trend.ruleType == "TABLE_CLEANER");

        var archiveDailyTrend = aggregatedDailyTrends.find(trend => trend.ruleType == "ARCHIVE");
        var tableCleanerDailyTrend = aggregatedDailyTrends.find(trend => trend.ruleType == "TABLE_CLEANER");

        if (archiveDailyTrend && archiveDailyTrend.backlogRecords && archiveDailyTrend.backlogRecords.length) {
            updateLatestTimestamp(archiveMonthlyTrend, archiveDailyTrend);
        }

        if (tableCleanerDailyTrend && tableCleanerDailyTrend.backlogRecords && tableCleanerDailyTrend.backlogRecords.length) {
            updateLatestTimestamp(tableCleanerMonthlyTrend, tableCleanerDailyTrend);
        }

        return aggregatedMonthlyTrends;
    }

    return [];

    function updateLatestTimestamp(monthlyTrend, dailyTrend) {
		if(!monthlyTrend || !monthlyTrend.backlogRecords) return dailyTrend;
        var backlogTrendMonthly = monthlyTrend.backlogRecords;
        var backlogTrendDaily = dailyTrend.backlogRecords;
        var latestDailyTrend = backlogTrendDaily[backlogTrendDaily.length - 1];

        if (backlogTrendMonthly.length) {
            var latestMonthlyTimestamp = backlogTrendMonthly[backlogTrendMonthly.length - 1].timestamp;
            if (latestDailyTrend.timestamp > latestMonthlyTimestamp && hasSameMonth(latestMonthlyTimestamp, latestDailyTrend.timestamp)) {
                backlogTrendMonthly.pop();
                backlogTrendMonthly.push(latestDailyTrend);
            }
        } else {
            backlogTrendMonthly.push(latestDailyTrend);
        }
    }

    function hasSameMonth(recentTrendTimestamp, recentTimestamp) {
        return new Date(recentTrendTimestamp).getUTCMonth() == new Date(recentTimestamp).getUTCMonth();
    }
}
