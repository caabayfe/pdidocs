/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { params } = event.payload;
    const query = params && params.query;
    const spokeString = query && query.split('spoke=')[1];
    const spoke = spokeString && spokeString.split('^')[0];
    helpers.navigate.to('spoke', null, {
        spokeName: spoke,
        startDate: api.context.props.startDate,
        endDate: api.context.props.endDate
    });
}
