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

    const {
        output
    } = api.data.get_funnel_record;
    if (output) {
        if (output.success) {
            api.setState('steps', JSON.parse(JSON.stringify(output.steps)));
            api.setState('funnelName', output.name);
        } else {
            console.log('Error while fetching the record', output);
            const {
                startDate,
                endDate,
            } = api.context.props;
            helpers.navigate.setRouteParams({
                params: {
                    startDate,
                    endDate, 
                }
            });
        }
    }
}
