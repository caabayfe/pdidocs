/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const url = encodeURI(`/api/sn_bot_install_ui/multi_instance_bot_ui/checkTeamsProductionBot/${api.state.client_id}`);
        

    if (event.payload.fieldValue != '')  {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(url, {method: 'GET'})
            .then(({response}) => {
                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                    id: "blocking",
                    loading: false
                });

                if(response.result) {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'alert5',
                            status: 'critical',
                            icon: 'exclamation-triangle-outline',
                            content: 'Error : As Client ID belongs to the default bot, please change to proceed further.',
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                    api.setState('buttonDisabled',true);
                } else {
                    api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                        items: [{
                            id: 'alert5'
                        }]
                    });
                }
            })
            .catch(({error}) => {
                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                    id: "blocking",
                    loading: false
                });

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
}
