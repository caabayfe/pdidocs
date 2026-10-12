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
    var translatedNA = await helpers.translate('N/A');
    var presentationalListColumnHeaders = {
        "columns": [{
                "key": "kpiName",
                "label": await helpers.translate("KPI Name"),
                "type": "link"
            }, {
                "key": "yourPerformance",
                "label": await helpers.translate("Your performance"),
                "type": "icon"
            }, {
                "key": "yourScore",
                "label": await helpers.translate("Your score"),
                "type": "string"
            },
            {
                "key": "benchmark",
                "label": await helpers.translate("Benchmark"),
                "type": "string"
            }, {
                "key": "topPerformers",
                "label": await helpers.translate("Top performers"),
                "type": "string"
            }, {
                "key": "percentileRank",
                "label": await helpers.translate("Percentile rank"),
                "type": "string"
            }
        ]
    };
    api.setState('presentationalListColumnHeaders', presentationalListColumnHeaders);
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
    var overviewData = api.context.props.overviewData;
    var overviewDataList = {};
    overviewDataList.rows = [];
    var selectedIndicatorIds = api.state.selectedIndicatorIds;
    //loop 
    for (var i = 0; i < overviewData.indicatorData.length; i++) {
        var currentIndicatorObject = overviewData.indicatorData[i];
        const {
            name,
            id,
            globalScore,
            localScore,
            minimize
        } = currentIndicatorObject;
        overviewDataList.rows[i] = {};
        overviewDataList.rows[i].cells = {};
        overviewDataList.rows[i].key = i;
        var currentIndicatorDetails = {};
        currentIndicatorDetails.name = name;
        currentIndicatorDetails.id = id;
        selectedIndicatorIds[i] = currentIndicatorDetails;

        //kpi name
        var kpiName;
        if (!name) {
            kpiName = '';
        } else {
            kpiName = name;
        }

        overviewDataList.rows[i].cells.kpiName = {
            "label": kpiName,
            "value": kpiName,
            "id": id

        };
        //benchmarkScore
        var benchmarkScore;
        if (!globalScore || !globalScore.display) {
            benchmarkScore = translatedNA;
        } else {
            benchmarkScore = globalScore.display;
        }
        overviewDataList.rows[i].cells.benchmark = {
            "value": benchmarkScore
        };

        // Your performance icon
        var localScoreValue;
        var globalScoreValue;
        if (!localScore || !localScore.value) {
            localScoreValue = 0;
        } else {
            localScoreValue = localScore.value;
        }
        if (!globalScore || !globalScore.mean) {
            globalScoreValue = 0;
        } else {
            globalScoreValue = globalScore.mean;
        }
        var isThumbDown = (minimize && localScoreValue > globalScoreValue) || (!minimize && localScoreValue < globalScoreValue);

        var color = '';
        if (globalScore && localScore) {
            if (isThumbDown) {
                overviewDataList.rows[i].cells.yourPerformance = {
                    "color": "critical",
                    "value": "thumbs-down-outline"
                };
            } else {
                overviewDataList.rows[i].cells.yourPerformance = {
                    "color": "positive",
                    "value": "thumbs-up-outline"
                };
            }
        }

        //yourScore
        var yourScore;

        if (!localScore || !localScore.display) {
            yourScore = translatedNA;
        } else {
            yourScore = localScore.display;
        }
        overviewDataList.rows[i].cells.yourScore = {
            "value": yourScore,
            "color": "positive"
        };

        //topPerformer
        var topPerformer;
        if (!globalScore || !globalScore.top10scoreDisplay) {
            topPerformer = 0;
        } else {
            topPerformer = globalScore.top10scoreDisplay;
        }
        overviewDataList.rows[i].cells.topPerformers = {
            "value": topPerformer
        };

        //rank
        var percentile;
        if (!globalScore || !globalScore.rank) {
            percentile = translatedNA;
        } else {
            percentile = globalScore.rank;
        }
        overviewDataList.rows[i].cells.percentileRank = {
            "value": percentile
        };
    }
    overviewDataList.rows.sort((a, b) => {
        var x = 0;
        if (a.cells.percentileRank && a.cells.percentileRank.value != translatedNA) {
            x = parseFloat(a.cells.percentileRank.value);
        }
        var y = 0;
        if (b.cells.percentileRank && b.cells.percentileRank.value != translatedNA) {
            y = parseFloat(b.cells.percentileRank.value);
        }
        return x - y;
    });
    api.setState("overviewDataList", overviewDataList);
    benchmarksUtils.setDataForList(api, overviewDataList, api.state.pageIndexListView);
}
