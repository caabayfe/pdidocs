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

    if (api.context.props.channelType == 'teams') {
        const {
            bot_name,
            tenant_id,
            client_id,
            client_secret
        } = api.state;
        const encodedTeamsBotName = encodeURIComponent(bot_name);
        const install_url = encodeURI(`/api/sn_va_teams/multi_instance_bot_ui/installTeamsCustomBot/${tenant_id}/${client_id}/${client_secret}/${encodedTeamsBotName}/false`);

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(install_url, {
            method: 'GET'
        })
        .then(({
            response
        }) => {
            if (response.result.hasOwnProperty('error') && response.result.error) {
                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                    id: "blocking",
                    loading: false
                });
                if (response.result.hasOwnProperty('message') && response.result.message) {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'alert5',
                            status: 'critical',
                            icon: 'exclamation-triangle-outline',
                            content: 'Error -> ' + response.result.message,
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                }
            } else if (response.result.hasOwnProperty('error') && !response.result.error) {
                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                    id: "blocking",
                    loading: false
                });
                if (response.result.hasOwnProperty('message') && response.result.message) {
                    if (response.result.hasOwnProperty('info') && response.result.info == true) {
                        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                            items: [{
                                id: 'alert5',
                                status: 'high',
                                icon: 'info-circle-outline',
                                content: 'IMPORTANT -> ' + response.result.message,
                                action: {
                                    type: 'dismiss'
                                }
                            }]
                        });
                    } else {
                        helpers.navigate.to('install-teams-self-config-confirmation', {
                            'botName': bot_name
                        }); 
                    }
                }
            } else {
                if (response.result.hasOwnProperty('installBot') && response.result.installBot) {
                    helpers.navigate.to('install-teams-self-config-confirmation', {
                        'botName': bot_name
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

    if (api.context.props.channelType == 'slack') {
        const {
            slack_bot_name,
            enterprise_id,
            slack_client_secret,
            access_token
        } = api.state;
        const encodedBotName = encodeURIComponent(slack_bot_name);
        const install_url = encodeURI(`/api/sn_va_slack/multi_instance_slack_bot_ui/installSlackCustomBot/${enterprise_id}/${access_token}/${slack_client_secret}/${encodedBotName}/false`);

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(install_url, {
                method: 'GET'
            })
            .then(({
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
                    if (response.result.hasOwnProperty('updateSecret') && response.result.updateSecret) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'slack',
                                name: slack_bot_name,
                                type: 'update'
                            }
                        });
                    }

                    if (response.result.hasOwnProperty('installBot') && response.result.installBot) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'slack',
                                name: slack_bot_name,
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


    if (api.context.props.channelType == 'messenger') {
        const {
            messenger_bot_name,
            app_id,
            inbound_id,
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
                    if (response.result.hasOwnProperty('update') && response.result.update && !response.result.error && response.result.hasOwnProperty('error')) {
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

                    if (response.result.hasOwnProperty('error') && !response.result.error && response.result.hasOwnProperty('update') && !response.result.update) {
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

    if (api.context.props.channelType == 'line') {
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
                    'hash_secret': line_hash_secret
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

    if (api.context.props.channelType == 'google-chat') {
        const {
            google_chat_bot_name,
            inbound_service_account_email,
            outbound_service_account_email,
            private_key_password,
            attachmentSysId,
        } = api.state;
        const install_url = encodeURI(`/api/sn_va_google_chat/multi_instance_google_chat_bot_ui/installGoogleChatCustomBot/${google_chat_bot_name}/${inbound_service_account_email}/${outbound_service_account_email}/${private_key_password}/${attachmentSysId}/false`);

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
        });

        helpers.snHttp(install_url, {
                method: 'GET'
            })
            .then(({
                response
            }) => {
                if (response.result.hasOwnProperty('error') && response.result.error) {
                    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                        id: "blocking",
                        loading: false
                    });

                    if (response.result.hasOwnProperty('message') && response.result.message) {
                        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                            items: [{
                                id: 'alert5',
                                status: 'critical',
                                icon: 'exclamation-triangle-outline',
                                content: 'Error -> ' + response.result.message,
                                action: {
                                    type: 'dismiss'
                                }
                            }]
                        });
                    }
                } else {
                    if (response.result.hasOwnProperty('installBot') && response.result.installBot) {
                        api.emit("NAV_ITEM_SELECTED", {
                            route: "channel-settings",
                            reload: true,
                            params: {
                                channel: 'google-chat',
                                name: google_chat_bot_name,
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

}
