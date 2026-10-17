 /**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const channel_type = api.context.props.payload.pageParams.channel;
    const button_type = api.context.props.payload.props_details.header;

    if (button_type == 'Now Virtual Agent') {
        helpers.snHttp(`/api/sn_oe_sfs/bot_install/${channel_type}/va`, {method: 'GET'})
        .then(({response}) => {
            api.emit("NAV_ITEM_SELECTED", {
                external: {
                    url: response.result
                }
            });      
        })
        .catch(({error}) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
            });
        });
    }

    if (button_type == 'Self-configured') {
        helpers.navigate.to('channel-self-configured-bot-install',{
            'channelType': channel_type
        });
    }  
}
