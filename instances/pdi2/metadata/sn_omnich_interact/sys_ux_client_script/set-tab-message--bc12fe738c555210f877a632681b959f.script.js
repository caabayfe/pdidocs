
			/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let type = '';
    let wrapUpMessage = '';
    if (api.context.props?.interactionType === 'chat') {
        type = 'Chat';
        wrapUpMessage = 'Chat is in wrap-up';
    } else if (api.context.props?.interactionType === 'phone') {
        type = 'Call';
        wrapUpMessage = 'Wrap-up initiated';
    } else if (api.context.props?.interactionType === 'email') {
        type = 'Email';
        wrapUpMessage = 'Email is in wrap-up';
    }
    const tabMessage = await helpers.translate('{0}', [wrapUpMessage]);

    if (type !== '') {
        api.emit('SCREEN_STATUS_CHANGED', {
            secondaryTitle: {
                label: tabMessage
            }
        });
    }
}
