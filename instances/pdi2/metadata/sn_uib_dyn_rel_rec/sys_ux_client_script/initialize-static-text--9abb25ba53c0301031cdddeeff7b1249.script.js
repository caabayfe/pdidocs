/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    helpers.translate("Search is unavailable for this list because it isn’t indexed").then((value) =>{
        api.setState("searchNotAvailableText",value);
    });
    helpers.translate("Create a new record").then((value1) =>{
        api.setState("createText",value1);
    });
    helpers.translate("No create access for this table").then((value2) =>{
        api.setState("cannotCreateText",value2);
    });
}
