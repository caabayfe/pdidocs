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
            bot_name: messenger_bot_name,
            app_id,
            inbound_id
        } = api.data.fetchmessengerbotdetails_1.output.bot_info;
        const {
            messenger_hash_secret,
            messenger_access_token
        } = api.state;
        const install_url = encodeURI(`/api/sn_va_fb_messenger/_fb_messenger_custom_bot_integration/install_bot`);

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(install_url, {
                method: 'POST',
                batch: true,
                body: {
                    'bot_name': messenger_bot_name,
                    'token': messenger_access_token,
                    'hash_secret': messenger_hash_secret,
                    'inbound_id': inbound_id,
                    'app_id': app_id
                }
            }).then(({
                response
            }) => {
                if (response.result.hasOwnProperty('error') && response.result.error) {
                    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                        id: "blocking",
                        loading: false
                    });

                    if (!response.result.hasOwnProperty('status') && response.result.hasOwnProperty('update') && response.result.update) {
                        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                            items: [{
                                id: 'alert5',
                                status: 'critical',
                                icon: 'exclamation-triangle-outline',
                                content: {
                                    type: 'html',
                                    value: '<span>Error: ' + response.result.message + '</br>Update bot details to integrate a new bot or the Signing Secret to update the existing bot.</span>'
                                },
                                action: {
                                    type: 'dismiss'
                                }
                            }]
                        });
                        api.setState('buttonDisabled', true);
                    } else if (!response.result.hasOwnProperty('status') && response.result.hasOwnProperty('update') && !response.result.update) {
                        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                            items: [{
                                id: 'alert5',
                                status: 'critical',
                                icon: 'exclamation-triangle-outline',
                                content: 'Error : ' + response.result.message,
                                action: {
                                    type: 'dismiss'
                                }
                            }]
                        });
                        api.setState('buttonDisabled', true);
                    }

                    if (response.result.hasOwnProperty('status') && response.result.status == 'failure') {
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
                    }
                } else {
                    if (response.result.hasOwnProperty('update') && response.result.update && !response.result.error) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'messenger',
                                name: messenger_bot_name,
                                type: 'update'
                            }
                        });
                    }

                    if (response.result.hasOwnProperty('error') && !response.result.error && !response.result.hasOwnProperty('update')) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'messenger',
                                name: messenger_bot_name,
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
