try {
    var customInsightType = "itsm_benchmark";
    var startDate = event.parm1;
    var endDate = new GlideDateTime(startDate);
    endDate.addMonthsUTC(1);
    endDate = endDate.getDate().toString();

    var bmInsightsUtil = new sn_benchmarks.BenchmarkInsightUtil();
    var bmRecords = bmInsightsUtil.fetchBenchmarkScores(startDate, endDate);

    startDate = startDate.replace(/-/g, "");
    endDate = JSON.parse(endDate.replace(/-/g, ""));

    for (var i = 0; i < bmRecords.length; i++) {
        var uuid = {
            "indicatorSysID": bmRecords[i].uuid,
            "domainSysID": "global"
        };

        var existingInsight = new sn_par_intelligence.CustomInsight().getInsights(customInsightType, JSON.stringify(uuid), startDate, endDate);
        var insightObj = JSON.parse(existingInsight)[0];

        if (!insightObj) {
            new sn_par_intelligence.CustomInsight().create(customInsightType, JSON.stringify(uuid), JSON.stringify(bmInsightsUtil.getInsightData(bmRecords[i])));
            gs.info('Benchmark insights inserted in PAR computed insight table for a month which has start-date as ' + startDate);
        } else {
            new sn_par_intelligence.CustomInsight().updateData(insightObj['sysID'], JSON.stringify(bmInsightsUtil.getInsightData(bmRecords[i])));
            gs.info('Benchmark insights updated in PAR computed insight table for a month which has start-date as ' + startDate);
        }
    }
} catch (e) {
    gs.info("Error in script action - 'Insert benchmark insights to PAR table': " + e);
}
