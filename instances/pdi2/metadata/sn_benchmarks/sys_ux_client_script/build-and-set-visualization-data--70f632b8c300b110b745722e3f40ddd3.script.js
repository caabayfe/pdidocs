/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var bmScoreOrtopScoreIsNA = false;
    var setScores = async (benchmarkScore, top10Score, rank, instanceScore, translatedNA) => {
        benchmarkScore = benchmarkScore == null ? translatedNA : benchmarkScore.toString();
        top10Score = top10Score == null ? translatedNA : top10Score.toString();
        instanceScore = instanceScore == null ? translatedNA : instanceScore.toString();
        rank = rank == null ? translatedNA : rank.toString();
        bmScoreOrtopScoreIsNA = benchmarkScore == translatedNA || top10Score == translatedNA;
        var bmStackDetails = [{
                "label": await helpers.translate("Benchmark"),
                "value": benchmarkScore
            },
            {
                "label": await helpers.translate("Your score"),
                "value": instanceScore
            },
            {
                "label": await helpers.translate("Top performers"),
                "value": top10Score
            },
            {
                "label": await helpers.translate("Percentile rank"),
                "value": rank
            }
        ];
        api.setState("bmHeaderDetails", bmStackDetails);
    };
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();

    const {
        indicatorKpiId,
        selectedCohort,
        selectedCategory
    } = api.context.props;

    const benchmarksData = api.data.get_benchmarks_data_2.output;
    const indicatorData = benchmarksData.indicators.idMap[indicatorKpiId];
    const currentMonth = benchmarksData.currentMonth;
    var currentMonthScores = indicatorData && indicatorData.scores && indicatorData.scores[currentMonth];
      currentMonthScores =  benchmarksUtils.updateLocalGlobal(currentMonthScores);
    const [trendLineData, unit] = await benchmarksUtils.getVisualizationDataForSelectedIndicator(indicatorData, helpers);
    api.setState("trendData", trendLineData);
    api.setState("indicatorUnit", unit);
    const translatedNA = await helpers.translate("N/A");
    if (currentMonthScores) {
            let {
                display,
                top10scoreDisplay,
                rank
            } = currentMonthScores.global;
            setScores(display, top10scoreDisplay, rank, currentMonthScores.local.display, translatedNA);
    } else {
        setScores(translatedNA, translatedNA, translatedNA, "0", translatedNA);
    }
    api.setState("sidebarInformation", {
        'name': benchmarksData.indicators.idMap[indicatorKpiId].display,
        'description': benchmarksData.indicators.idMap[indicatorKpiId].description,
        'bmScoreOrtopScoreIsNA': bmScoreOrtopScoreIsNA
    });
    api.setState("hideLoader", true);
}
