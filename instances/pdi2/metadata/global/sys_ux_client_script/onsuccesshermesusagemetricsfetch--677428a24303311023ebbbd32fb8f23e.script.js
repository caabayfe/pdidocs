/**
 * After server side fetch of hermes Usage Metrics table is a success 
 * this client script is executed
 * 
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let timeSeriesData = api.data.on_filter_change_hermes_metric_look_up.results;
    let timeSeriesLineGraphData;
    let mbInAggScore;
    let mbOutAggScore;
    configureScoreData();
    configureLineGraphData();
    setStateData();

    /***
     * Fetched time series metrics data is transformed into a template 
     * the line graph compoenent can use
     */
    function configureLineGraphData() {
        const {
            getTimeSeriesLineGraphData
        } = imports["global.HermesUsageMetricsUtil"]();
        let timeSeriesArgs = {
            timeSeriesData,
            userSessionTimeZoneOffset: api.context.session.user.timeZoneOffset
        };
        timeSeriesLineGraphData = getTimeSeriesLineGraphData(timeSeriesArgs);
    }

    /***
     * Fetched time series metrics data is transformed into a template 
     * the score card graphs compoenent can use
     */
    function configureScoreData() {
        const {
            getAggregateScoreGraphJson,
            getAggregateMbInAndOut
        } = imports["global.HermesUsageMetricsUtil"]();
        let mbInOutProperties = getAggregateMbInAndOut({timeSeriesData});
        let mbInAggArgs = {
            aggValue: mbInOutProperties.get("BytesInPerSec")
        };
        mbInAggScore = getAggregateScoreGraphJson(mbInAggArgs);
        let mbOutAggArgs = {
            aggValue: mbInOutProperties.get("BytesOutPerSec")
        };
        mbOutAggScore = getAggregateScoreGraphJson(mbOutAggArgs);
    }

    function setStateData() {
        api.setState("timeSeriesLineGraphData", timeSeriesLineGraphData);
        api.setState("megabyteInAgg", mbInAggScore);
        api.setState("megabyteOutAgg", mbOutAggScore);
    }
}
