/**
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
    let legacyData = api.data.data_visualization_api_for_bar_chart_data_source.output.result[0].response;

    // Extract row labels from legacy data
    if (!legacyData.data) {
        api.setState("chartData", [{}]);
        return;
    }

    let groupByLabel = legacyData.data[0][0];
    let groupId = legacyData.data[0][1];
    let valueLabel = legacyData.data[0][2];
    const rows = legacyData.data.slice(1);

    // Map legacy data into object format to match data sources format
    let newData = rows.map(([group, group_id, value], index) => {
        return {
            [groupByLabel]: group,
            [groupId]: group_id,
            [valueLabel]: value
        };
    });
    
    var chartData = {};
    chartData.data = newData;
    chartData.metadata = legacyData.metadata;
    api.setState('chartData', [chartData]);
}
