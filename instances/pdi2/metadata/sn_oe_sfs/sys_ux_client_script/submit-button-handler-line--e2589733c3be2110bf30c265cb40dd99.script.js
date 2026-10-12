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
        const {
            app_id,
            inbound_id
        } = api.data.fetchlinebotdetails_1.output.bot_info;
        const {
            line_bot_name,
            line_hash_secret,
            line_access_token
        } = api.state;
        const install_url = encodeURI(`/api/sn_va_line/_line_messenger_custom_bot_integration/install_bot`);

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(install_url, {
                method: 'POST',
                batch: true,
                body: {
                    'bot_name': line_bot_name,
                    'token': line_access_token,
                    'hash_secret': line_hash_secret,
                    'inbound_id': inbound_id,
                    'app_id': app_id
                }
            }).then(({
                response
            }) => {
                if (response.result.error) {
                     api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                        id: "blocking",
                        loading: false
                    });
                        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                            items: [{
                                id: 'alert5',
                                status: 'critical',
                                icon: 'exclamation-triangle-outline',
                                content: 'Error : Integration or updation failed. Please try again.',
                                action: {
                                    type: 'dismiss'
                                }
                            }]
                        });
                } else {
                    if ( response.result.update && !response.result.error) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'line',
                                name: line_bot_name,
                                type: 'update'
                            }
                        });
                    }

                    if ( !response.result.error && !response.result.update) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'line',
                                name: line_bot_name,
                                type: 'install'
                            }
                        });
                    }
                }
            })
            .catch(({
                error
            }) => {
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
                    action: {
                        type: 'dismiss'
                    }
                });
            });
    
}
