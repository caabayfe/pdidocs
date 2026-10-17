/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const checkList = api.data.fetch_guidance_details.result.checklist.displayValue;
    const route = checkList ? 'checklist' : 'setup'
        helpers.navigate.to(route, {
            "sysId": api.context.props.setupId
        }, {
            "customId": new Date().getTime()
        });
}
