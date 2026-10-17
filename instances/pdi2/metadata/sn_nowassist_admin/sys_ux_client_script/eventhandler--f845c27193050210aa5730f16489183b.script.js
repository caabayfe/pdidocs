/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    switch (event.elementId) {
        case "name":
            api.setState('name', event.payload.fieldValue);
            emitOverrideFunctionEvent(event.payload.fieldValue, api.state.description);
            var purgeDescription = api.state.description.replace("<p>","");
            purgeDescription = purgeDescription.replace("</p>","");
            if (purgeDescription.trim() == '' || event.payload.fieldValue.trim() == '') {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_DISABLE_NEXT',
                    eventPayload: {}
                });
            } else {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_ENABLE_NEXT',
                    eventPayload: {}
                });
            }
            break;
        case "description":
            var newDescription = '<p>' + event.payload.fieldValue + '</p>';
            api.setState('description', newDescription);
            emitOverrideFunctionEvent(api.state.name, newDescription);
            if (api.state.name.trim() == '' || event.payload.fieldValue.trim() == '') {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_DISABLE_NEXT',
                    eventPayload: {}
                });
            } else {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_ENABLE_NEXT',
                    eventPayload: {}
                });
            }
            break;
        case "save_skill_config_general_details":

            if (event.payload.data.output.updated) {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_UPDATE_SKILL_GENERAL_DETAILS',
                    eventPayload: {
                        name: api.state.name,
                        description: api.state.description,
                        skillTranslatedText: event.payload.data.output.skillTranslatedText
                    }
                });
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_GO_TO_NEXT_STEP',
                    eventPayload: {}
                });
            }
            break;
    }

    function emitOverrideFunctionEvent(name, description) {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_OVERRIDE_SAVE',
            eventPayload: {
                overrideFunction: saveSkillConfigData,
                payload: {
                    sysId: api.context.props.payload.guided_context.skill_config_id,
                    name: name,
                    description: description,
                    skillFamilyName: api.context.props.payload.guided_context.skill_family_name,
                    skillParentame: api.context.props.payload.guided_context.skill_parent_name,
                    skillFamilyParentName: api.context.props.payload.guided_context.skill_family_parent_name
                }
            }
        });
    }

    function saveSkillConfigData(guided_context, payload) {
        api.data.save_skill_config_general_details.execute({
            payload
        });
    }
}
