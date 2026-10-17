/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const presetName = api.state.presetName;
    const presetDescription = api.state.presetDescription;
    const componentId = api.state.selectedComponent.macroponentSysId;
    const controllerId = api.state.selectedController.id;
    const payload = {
            name: presetName,
            description: presetDescription,
            component: componentId,
            controller: controllerId
        };
    if(presetName && componentId && controllerId) {
        api.data.create_preset_record_set_1.execute(payload);
    }
}
