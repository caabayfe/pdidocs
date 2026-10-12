/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
/**
 * This script's role is to transform results that are returned from Data Visualization API
 * and adapt them to Pie Chart component.
 * Data Visualization API seems to be returning legacy format
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let legacyData = api.data.data_visualization_api_for_gaps_data_source.output.result[0].response;

    // Initialize gap counts
    let gapTaskCount = 0;
    let currentGapCount = 0;
    if(!legacyData.data) {
        api.setState('gapTaskCount', gapTaskCount);
        api.setState('currentGapCount', currentGapCount);
        return;
    }

    // Extract row labels from legacy data
    let groupByLabel = legacyData.data[0][0];
    let valueLabel = legacyData.data[0][1];
    const rows = legacyData.data.slice(1);

    // Map legacy data into object format to match Pie Chart data sources format
    let newData = rows.map(([group, value], index) => {
        gapTaskCount += Number(value);
        currentGapCount = currentGapCount+1;
        return {
            [groupByLabel]: group,
            [valueLabel]: value
        };
    });

    var gapData = {};
    gapData.data = newData;
    gapData.metadata = legacyData.metadata;
    api.setState('gapTaskCount', gapTaskCount);
    api.setState('currentGapCount', currentGapCount);
    api.setState('gapData', [gapData]);
}
