/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.targetField.selectedValue = event.payload.value;
    entityForm.fields.targetField.label = event.payload.item.label;
    entityForm.fields.targetField.invalid = false;
    api.setState('entityForm', entityForm);

    // If parent entity already has 5 default activity definitions, show an alert
    // warning the user that reference activity will not be created
    const parentEntityId = entityForm.fields.parentEntity.selectedValue;
    if (!parentEntityId)
        return;

    const entitiesData = [...api.state.entityCardRepeaterData];
    const parentEntity = entitiesData.find(e => e.entityId === parentEntityId);
    if (!parentEntity)
        return;
    
    const defaultActivitiesCount = parentEntity.activities.filter(ad => ad.type === api.state.ACTIVITY_TYPES.DEFAULT).length;
    if (defaultActivitiesCount >= 5) {
        api.setState('hideParentADsWarning', false);
    } else {
        api.setState('hideParentADsWarning', true);
    }
}
