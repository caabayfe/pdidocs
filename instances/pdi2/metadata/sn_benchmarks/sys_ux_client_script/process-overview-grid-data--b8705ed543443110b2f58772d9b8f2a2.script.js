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
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
    if (!api.context.props.overviewData) {
        return;
    }
    var overviewData = api.context.props.overviewData;
    var translatedNA = await helpers.translate('N/A');

    // overviewHeader
    var header = '';
    if (overviewData && overviewData.month) {
        header = overviewData.month;
    }
    const translatedHeader = await helpers.translate('Overview of {0}', header);
    api.setState('overviewHeading', translatedHeader);

    // industry
    var industry = '';
    if (overviewData && overviewData.industry) {
        industry = overviewData.industry;
    }
    const translatedIndustry = await helpers.translate('Industry');
    api.setState('industry', [{
        "label": translatedIndustry,
        "value": {
            "type": "string",
            "value": industry
        }
    }]);

    //sizeBucket
    var sizeBucket = '';
    if (overviewData && overviewData.sizeBucket) {
        sizeBucket = overviewData.sizeBucket;
    }
    const translatedSizeBucket = await helpers.translate('Number of users');
    api.setState("sizeBucket", [{
        "label": translatedSizeBucket,
        "value": {
            "type": "string",
            "value": sizeBucket
        }
    }]);

    // region
    var region = '';
    if (overviewData && overviewData.region) {
        region = overviewData.region;
    }
    const translatedRegion = await helpers.translate('Region');
    api.setState('region', [{
        "label": translatedRegion,
        "value": {
            "type": "string",
            "value": region
        }
    }]);

    //loop
    for (var i = 0; i < overviewData.indicatorData.length; i++) {
        var currentIndicatorObject = overviewData.indicatorData[i];
        var { name, id, globalScore, localScore, minimize } = currentIndicatorObject;

        //benchmarkScore
        var benchmarkScore = 0;
        if (globalScore && globalScore.display) {
            benchmarkScore = globalScore.display;
        }
        else {
            benchmarkScore = translatedNA;
        }
        const translatedText = await helpers.translate('Benchmark');
        overviewData.indicatorData[i].benchmarkScore = [{
            "label": translatedText,
            "value": {
                "type": "string",
                "value": benchmarkScore
            }
        }];

        //yourScore
        var yourScoreValue;
        if (!localScore || !localScore.display) {
            yourScoreValue = translatedNA;
        } else {
            yourScoreValue = localScore.display;
        }
        const translatedYourScore = await helpers.translate('Your score');
        overviewData.indicatorData[i].yourScore = [{
            "label": translatedYourScore,
            "value": {
                "type": "string",
                "value": yourScoreValue
            }
        }];

        //topPerformer
        var topPerformer = 0;
        if (globalScore && globalScore.top10scoreDisplay) {
            topPerformer = globalScore.top10scoreDisplay;
        }

        const translatedTopPerformer = await helpers.translate('Top performers');
        overviewData.indicatorData[i].topPerformer = [{
            "label": translatedTopPerformer,
            "value": {
                "type": "string",
                "value": topPerformer
            }
        }];

        //rank
        var percentile = 0;
        if (globalScore && globalScore.rank) {
            percentile = globalScore.rank;
        }
        else {
            percentile = translatedNA;
        }
        const translatedRank = await helpers.translate('Percentile');
        overviewData.indicatorData[i].rank = [{
            "label": translatedRank,
            "value": {
                "type": "string",
                "value": percentile
            }
        }];

        //thumbsUpMessage
        var localScoreValue;
        var globalScoreValue;
        var unit;
        var converter = function timeDifferenceConvert(difference, unit) {
            if (unit != 'd' && unit != 'h') {
                return difference;
            }
            var time = difference;
            if (unit == 'd') {
                time = time * 24;
            }
            var days = Math.floor(time / 24);
            var remainder = time % 24;
            var hours = Math.floor(remainder);

            if (days === '0') {
                if (hours === '0') {
                    return remainder + ' h';
                } else {
                    return hours + ' h';
                }
            } else {
                if (hours === '0') {
                    return days + ' d';
                } else {
                    return days + ' d ' + hours + ' h';
                }
            }
        };
        if (localScore && globalScore) {
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
            if (!currentIndicatorObject || !currentIndicatorObject.unit) {
                unit = '';
            } else {
                unit = currentIndicatorObject.unit;
                if (unit.toLowerCase().includes("hrs")) {
                    unit = "h";
                } else if (unit.toLowerCase().includes("days")) {
                    unit = "d";
                } else {
                    unit = '';
                }
            }
            var infoMessage = '';
            var thumbsUpMessage = '';
            if (localScoreValue - globalScoreValue == 0) {
                thumbsUpMessage = await helpers.translate('Your score is at par with benchmark');
            }
            else if (minimize == false) {
                infoMessage = await benchmarksUtils.timeDifferenceConvert((localScoreValue - globalScoreValue), unit);
                thumbsUpMessage = await helpers.translate('Your score is above benchmark by {0}', infoMessage);

            } else {
                infoMessage = await benchmarksUtils.timeDifferenceConvert((globalScoreValue - localScoreValue), unit);
                thumbsUpMessage = await helpers.translate('Your score is above benchmark by {0}', infoMessage);
            }
            overviewData.indicatorData[i].thumbsUpMessage = thumbsUpMessage;


            //thumbsDownMessage
            var infoMessage = '';
            var thumbsDownMessage = '';
            if (minimize == true) {
                infoMessage = await benchmarksUtils.timeDifferenceConvert((localScoreValue - globalScoreValue), unit);
                thumbsDownMessage = await helpers.translate('Your score is below benchmark by {0}', infoMessage);
            } else {
                infoMessage = await benchmarksUtils.timeDifferenceConvert((globalScoreValue - localScoreValue), unit);
                thumbsDownMessage = await helpers.translate('Your score is below benchmark by {0}', infoMessage);
            }
            overviewData.indicatorData[i].thumbsDownMessage = thumbsDownMessage;


            // Hide thumbs up/down message container
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
            overviewData.indicatorData[i].hideThumbsUpContainer = (minimize && localScoreValue > globalScoreValue) || (!minimize && localScoreValue < globalScoreValue);
            overviewData.indicatorData[i].hideThumbsDownContainer = !overviewData.indicatorData[i].hideThumbsUpContainer;
        } else {
            overviewData.indicatorData[i].hideThumbsUpContainer = true;
            overviewData.indicatorData[i].hideThumbsDownContainer = true;
        }
    }
    overviewData.indicatorData.sort((a, b) => {
        var x = 0;
        var y = 0;

        if (a.rank[0].value.value != translatedNA) {
            x = a.rank[0].value.value;
        }
        if (b.rank[0].value.value != translatedNA) {
            y = b.rank[0].value.value;
        }
        return x - y;
    });
    var pageSize = api.state.pageSize;
    var startingIndex = api.state.pageIndex * pageSize;
    var indicatorDataLength = overviewData.indicatorData.length;
    var endingIndex = (api.state.pageIndex + 1) * pageSize;
    if (indicatorDataLength < endingIndex) {
        endingIndex = indicatorDataLength;
    }
    api.setState("pageSizesArray", [api.state.pageSize]);
    api.setState("totalNumberOfRecords", overviewData.indicatorData.length);
    api.setState("overviewData", overviewData);
    api.setState("indexedData", overviewData.indicatorData.slice(startingIndex, endingIndex));
    if (api.state.pageIndex != 0) {
        api.setState("pageIndex", api.state.pageIndex);
    }
}
