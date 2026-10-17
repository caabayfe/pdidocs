migrateLastYearDailyAssistCount();

function migrateLastYearDailyAssistCount() {
    var daysAgo = 400;
    var cutoffDate = new GlideDateTime();
    cutoffDate.addDaysUTC(-daysAgo);

    var defnGR = new GlideRecord("ua_defn_agg_data");
    defnGR.addQuery("sys_created_on", '>=', cutoffDate);
	defnGR.addQuery("agg_type", "sum");
    defnGR.orderByDesc("sys_created_on");
    defnGR.addQuery("definition_id", "DEFN2006407");
    defnGR.query();

    while (defnGR.next()) {
        var feature = defnGR.getValue("group1");
        var assistCount = parseInt(defnGR.getValue("agg_val")) || 0;
        var accrualTime = defnGR.getValue("sys_created_on");
        var assistGR = new GlideRecord("now_assists_skills");
        assistGR.initialize();
        assistGR.setValue("feature", feature);
        assistGR.setValue("lookback", "365");
        assistGR.setValue("used_assists", assistCount);
        assistGR.setValue("accrual_time", accrualTime);
        assistGR.insert();
    }
}
