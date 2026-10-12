/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/ 
function handler({api, event, helpers, imports}) {
    const {
        button_action_type,
        button_action_payload,
    } = api.context.props.payload.props_details;

    if (button_action_type === 'link') {
		api.emit('NAV_ITEM_SELECTED', {
			external: {
				url: button_action_payload
			}
		});
	}
}
