/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        selectedClass
    } = api.state;

    // Show loading text only when selectedClass is still empty
    if (selectedClass == "") {
        let loadingClasses = [{
            "id": "",
            "label": await helpers.translate('Loading classes...')
        }];
        api.setState("allCIClasses", loadingClasses);
        api.setState("selectedClass", loadingClasses[0].id);
    }
}
