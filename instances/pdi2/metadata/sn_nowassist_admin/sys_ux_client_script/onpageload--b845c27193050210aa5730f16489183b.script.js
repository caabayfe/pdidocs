/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isReadOnly',!api.context.props.payload.guided_context.is_variant);
    api.setState('name',api.context.props.payload.guided_context.skill_config_title);
    api.setState('description',api.context.props.payload.guided_context.skill_description);

    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_OVERRIDE_SAVE',
        eventPayload: {
            overrideFunction: moveToNextStep,
            payload: {}
        }
    });

if(api.state.name.trim() == '' || api.state.description.trim() == ''){
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

    function moveToNextStep(guided_context, payload) {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_GO_TO_NEXT_STEP',
            eventPayload: {}
        });
    }
}
