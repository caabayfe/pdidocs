/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    let result = api.data.get_resticted_mode_property.output.properties['glide.duplicate_ci_remediator.enable_restricted_mode'];
    let restrictedMode = (result === 'true');
    let remediateOptions = [{
        "checked": true,
        "id": "remediate_manually",
        "label": await helpers.translate("Use the Duplicate CI Remediator")
    },{
        "id": "remediate_using_template",
        "label": await helpers.translate("Remediate using a template")
    }];

    if(restrictedMode) {
        remediateOptions.splice(1,0,{
            "id": "remediate_manually_restricted",
            "label": await helpers.translate("Use the Duplicate CI Remediator in Restricted Mode")
        });
    }

    api.setState("remediateOptions",remediateOptions);
    api.setState("selectedRemediateOption", "remediate_manually");
    api.setState("restrictedMode",restrictedMode);

}
