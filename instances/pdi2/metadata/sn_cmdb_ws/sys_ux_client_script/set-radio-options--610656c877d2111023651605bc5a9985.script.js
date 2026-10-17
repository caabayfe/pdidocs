/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var weightTypeOptions = [{id:"automatic",
                            label: await helpers.translate("Automatic data weights")},
                            {id:"manual",
                            label: await helpers.translate("Manual data weights")}];

    api.setState("dataMismatchWeightsOptions",weightTypeOptions);
    api.setState("coverageWeightsOptions",weightTypeOptions);

    var attrTypeOptions = [{id:2,label: await helpers.translate("Show CIs where EVERY attribute doesn't match")},
                {id : 1,
                label : await helpers.translate("Show CIs where ANY attribute doesn't match"), checked:true}];

    api.setState("attrTypeOptions",attrTypeOptions);
}
