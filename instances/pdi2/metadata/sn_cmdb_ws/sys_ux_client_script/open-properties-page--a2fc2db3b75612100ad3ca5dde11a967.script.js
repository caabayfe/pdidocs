/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    helpers.navigate.to(undefined, undefined, {}, false, false, null, {
        url: "$cmdb_health_properties.do"
    });
}
