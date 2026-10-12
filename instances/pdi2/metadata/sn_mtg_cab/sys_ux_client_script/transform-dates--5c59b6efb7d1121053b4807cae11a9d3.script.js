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
    let stackedDate = [];
    let startDate = {};
    startDate.label = await helpers.translate("Planned start");
    startDate.value = {
        type: 'string',
        value: api.context.props.startDate
    };

    let endDate = {};
    endDate.label = await helpers.translate("Planned end");
    endDate.value = {
        type: 'string',
        value: api.context.props.endDate
    };

    stackedDate.push(startDate);
    stackedDate.push(endDate);
    api.setState('stackedDates', stackedDate);
}
