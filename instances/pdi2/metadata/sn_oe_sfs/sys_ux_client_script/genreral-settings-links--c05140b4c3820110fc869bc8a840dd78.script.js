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
        eventName,
        eventPayload
    } = event.payload;
    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);
    const {
        name
    } = eventPayload.content_block || {};
    switch (eventName) {
        case 'BRANDING_VIEW_ALL':
            navigateToList(api, 'sys_cs_branding_setup',{"aceNav":"general"});
            break;
        case 'CHANNELS_VIEW_ALL':
            trackUsage('CI - Settings Nav - Channels', {
                title: name || 'Channels',
                page: 'Settings',
                type: 'Simple Card',
                'aceNav':'general'
            });
            navigateToRoute(api, 'channel-settings','',{"aceNav":"general"});
            break;
        case 'ROUTE_TO_TOPIC_CONTEXT_INTENT':
            trackUsage('CI - Settings Nav - Context Topic Intent ', {
                title: name || 'Context Topic Intent',
                page: 'Settings',
                type: 'Simple Card',
                'aceNav':'general'
            });
            navigateToList(api, 'sys_cs_context_topic', {
                't': Date.now(),
                'view': 'ci_admin_console',
                'aceNav':'general'
            });
            break;
        case 'VIEW_ALL_PRE_CHAT_SURVEY':
            trackUsage('CI - Settings Nav - Pre-Chat Survey', {
                title: name || 'Pre-Chat Survey',
                page: 'Settings',
                type: 'Simple Card',
                'aceNav':'general'
            });
            navigateToList(api, 'sys_cs_survey', {
                't': Date.now(),
                'view': 'ci_admin_console',
                'filter': 'type=prechat^EQ',
                'aceNav':'general'
            });
            break;
        case 'URL_NAVIGATION_VIEW_ALL':
            trackUsage('CI - Settings Nav - URL navigation', {
                title: name || 'URL navigation',
                page: 'Settings',
                type: 'Simple Card',
                'aceNav':'general'
            });
            navigateToRoute(api, 'url-navigation-settings','',{'aceNav':'general'});
            break;

        case 'EMAIL_DIGEST_VIEW_SETTINGS':
           api.emit('NAV_ITEM_SELECTED', {
             route: 'missed-activity-emails',
             params: {
               t: Date.now(),
               'aceNav':'general'
            },
            fields: null,
            external: null
           });
           break;

        case 'SENSITIVE_DATA_VIEW_ALL':
            trackUsage('CI - Settings Nav - Sensitive Data Detection', {
                title: name || 'Sensitive Data Detection',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToRoute(api, 'sensitive-data');
            break;

        case 'OPEN_LIST_VIEW_FOR_TABLE':
            navigateToRoute(api, 'multi-language-support');
            break;

        case 'SYSTEM_MESSAGES_VIEW_ALL':
            navigateToList(api, 'sys_properties', {
                't': Date.now(),
                'view': 'ci_admin_console',
                'fixedFilter': 'sys_idDYNAMIC2ce328b2537230106d43ddeeff7b12d5',
                'aceNav':'general'
            });
            break;
        case 'CONTEXT_VARIABLES_VIEW_ALL':
            trackUsage('CI - Settings Nav - Context Variables', {
                title: name || 'Context Variables',
                page: 'Settings',
                type: 'Simple Card',
                'aceNav':'general'
            });
            navigateToList(api, 'sys_cs_virtual_agent_context', {
                't': Date.now(),
                'view': 'ci_admin_console',
                'fixedFilter': 'live_agent_setup=f0acbc4c5f091300e6333654de7313c8',
                'aceNav':'general'
            });
            break;
        case 'MESSAGE_PREVIEW_ALL':
            navigateToRoute(api, 'message-previews');
            break;
          case 'CALLBACK_LIST':
            navigateToRoute(api, 'omnichannel-callback');
            break;
          case 'TOGGLE_PROACTIVE_TRIGGER_PROP':
            api.setState('infoMessage', 'Proactive triggers settings saved successfully');
            api.setState('refreshContentBlocks', true);
            var value = eventPayload.toggleValue || (eventPayload.actual_event && eventPayload.actual_event.payload && eventPayload.actual_event.payload.value);
            api.data.update_record.execute({
                table: 'sys_properties',
                recordId: '3acce70253f011105400ddeeff7b127c',
                templateFields: 'value=' + value,
                useSetDisplayValue: null
            });
            break;
        case 'TOGGLE_MESSAGE_PREVIEW':
            api.setState('infoMessage', 'Message Preview settings saved successfully');
           var value = eventPayload.toggleValue || (eventPayload.actual_event && eventPayload.actual_event.payload && eventPayload.actual_event.payload.value);
            api.data.update_record.execute({
                table: 'sys_properties',
                recordId: '23a46ec3b76111107fc19e68ee11a963',
                templateFields: 'value=' + value,
                useSetDisplayValue: null
            });
            helpers.timing.setTimeout(function(){
                api.data.ace_fetch_content_blocks.refresh();
            }, 100);
            break;
     case 'TOGGLE_PUBLIC_ACCESS':
            var value = eventPayload.toggleValue || (eventPayload.actual_event && eventPayload.actual_event.payload && eventPayload.actual_event.payload.value);
            if (!api.data.check_if_any_assistants_are_public.output.genaiInstalled) {
                helpers.translate('VA chat web client settings saved successfully.').then((translatedText) => {
                    api.setState('infoMessage', translatedText);
                });
                api.data.update_record.execute({
                    table: 'sys_public',
                    recordId: '2e4b293773e013004ab2369f2ef6a7a5',
                    templateFields: 'active=' + value,
                    useSetDisplayValue: null
                });
                helpers.timing.setTimeout(function(){
                    api.data.ace_fetch_content_blocks.refresh();
                }, 100);
            }
            else {
                api.setState('publicAccess', value);
                if (api.data.check_if_any_assistants_are_public.output.publicActive || value) {
                    if (value) {
                        helpers.translate('Turn on public access?').then((translatedText) => {
                            api.setState('modalHeader', translatedText);
                        });
                        helpers.translate('Turn on').then((translatedText) => {
                            api.setState('modalActionButton', translatedText);
                        });
                        helpers.translate('If you proceed, any NLU Virtual Agents configured on public portals will be available to guest users.').then((translatedText) => {
                            api.setState('nluMessage', translatedText);
                        });
                        helpers.translate('Note: You will also need to turn on public access in guided setup for any Now Assist in Virtual Agent assistants that should be publicly available.').then((translatedText) => {
                            api.setState('alertMessage', translatedText);
                        });
                    }
                    else {
                        helpers.translate('Turn off public access?').then((translatedText) => {
                            api.setState('modalHeader', translatedText);
                        });
                        helpers.translate('Turn off').then((translatedText) => {
                            api.setState('modalActionButton', translatedText);
                        });
                        helpers.translate('This change will also apply to any NLU Virtual Agents configured on public portals.').then((translatedText) => {
                            api.setState('nluMessage', translatedText);
                        });
                        helpers.translate('The following assistants have public access enabled in guided setup. If you proceed, this setting will be turned off and the assistants will no longer be visible to guest users.').then((translatedText) => {
                            api.setState('alertMessage', translatedText);
                        });
                    }
                    helpers.modal.open('public_access_modal');
                }
                else {
                    if (!value) {
                        api.data.deactivate_public_assistant_agent_chats.execute();
                    }
                    helpers.translate('VA chat web client settings saved successfully.').then((translatedText) => {
                        api.setState('infoMessage', translatedText);
                    });
                    api.data.update_record.execute({
                        table: 'sys_public',
                        recordId: '2e4b293773e013004ab2369f2ef6a7a5',
                        templateFields: 'active=' + value,
                        useSetDisplayValue: null
                    });
                    helpers.timing.setTimeout(function(){
                        api.data.ace_fetch_content_blocks.refresh();
                    }, 100);
                }
            }
            break;    
    }


    function navigateToRoute(api, route, fields, params) {
        const payload = getNavPayload({
                route: route,
                fields: fields,
                params: params || {}
        });

        api.emit('NAV_ITEM_SELECTED', payload);
    }

    function navigateToList(api, table, params) {
        const payload = getNavPayload({
                route: 'list',
                fields: {
                    'table': table
                },
                params: params || {}
        });

        api.emit('NAV_ITEM_SELECTED', payload);
    }

    function getNavPayload({ route, fields, params }) {
        if(!params) {
            params = {};
        }

        if(!params.t) {
            params.t = Date.now();
        }

        return {
            route: route,
            fields: fields,
            params: params,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null
        };
    }
}
