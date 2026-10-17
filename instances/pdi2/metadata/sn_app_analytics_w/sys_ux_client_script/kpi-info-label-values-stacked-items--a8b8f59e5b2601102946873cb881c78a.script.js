/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const kpiConfig = api.state.kpiMetaData;
    if (kpiConfig) {
        const name = kpiConfig.name ? kpiConfig.name : '-';
        const description = kpiConfig.description ? kpiConfig.description : '-';
        const freq = kpiConfig.calendarFrequency ? kpiConfig.calendarFrequency.label : '-';
        const dir = kpiConfig.direction ? kpiConfig.direction.label : '-';

        return [{
            'label': helpers.translateSync('Name'),
            'value': name
        }, {
            'label': helpers.translateSync('Description'),
            'value': description
        }, {
            'label': helpers.translateSync('Frequency'),
            'value': freq
        }, {
            'label': helpers.translateSync('Direction'),
            'value': dir
        }];
    }
}
