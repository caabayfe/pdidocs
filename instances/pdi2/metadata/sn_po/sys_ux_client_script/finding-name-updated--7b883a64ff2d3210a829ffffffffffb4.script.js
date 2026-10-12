/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var currentFindingName = event.payload.findingName;
    api.setState('currentFindingName', currentFindingName);

    if (currentFindingName) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Improvement opportunity definition', currentFindingName),
        });
    }
}
