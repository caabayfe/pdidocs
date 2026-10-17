/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //Handle save button click
    const changedProperties = api.state.changedProperties || {};
    const propertiesToSave = Object.values(changedProperties);

    if (propertiesToSave.length > 0) {
        // Show saving indicator if needed
        api.setState('isSaving', true);
        // Call the save data broker
        api.data.update_knowledge_mangement_properties.execute({
        properties: propertiesToSave
        });
    }
}
