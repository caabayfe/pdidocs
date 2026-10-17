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
        block_id,
        name,
        props_details = {}
    } = eventPayload.content_block || {};

    switch (eventName) {
        case 'NLU_VIEW_SETTINGS':
            trackUsage('CI - Settings Nav - NLU Settings ', {
                title: name || 'NLU Settings',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToRoute(api, 'nlu-setting','',{'aceNav':'virtual-agent'});
            break;
        case 'TOPIC_RECOMMENDATIONS_VIEW_ALL':
            trackUsage('CI - Settings Nav - Topic Recommendations Configuration', {
                title: name || 'Topic Recommendations Configuration',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToList(api, 'sn_topic_recommend_default_setting',{'aceNav':'virtual-agent'});
            break;
        case 'CUSTOM_GREETINGS_VIEW_ALL':
            trackUsage('CI - Settings Nav - Custom Greetings and Setup', {
                title: name || 'Custom Greetings and Setup',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToList(api, 'sys_cs_context_profile', {
                'view': 'simple_chat_context_profiles',
                't': Date.now(),
                'aceNav':'virtual-agent'
            });
            break;
        case 'DEFLECTION_METRICS_VIEW_ALL':
            trackUsage('CI - Settings Nav - Deflection Metrics', {
                title: name || 'Deflection Metrics',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToRoute(api, 'deflection-settings','',{'aceNav':'virtual-agent'});
            break;
        case 'NAVIGATE_TO_CC_CONFIG':
            navigateToRoute(api, 'configure-cc','',{'aceNav':'virtual-agent'});
            break;

        case 'OPEN_LANGUAGES_LIST_VIEW':
            trackUsage('CI - Settings Nav - Multi Lang URL Nav', {
                title: 'Multi Language Settings',
                page: 'Settings',
                type: 'Simple Card'
            });
            navigateToList(api, 'sys_cs_dynamic_translation_virtual_agent',{'aceNav':'virtual-agent'});
            break;

        case 'IAR_VIEW_SETTINGS':
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: '/now/conversation/iar/home'
                }
            });
            trackUsage('CI - Settings Nav - IAR Navigation', {
                title: eventPayload.content_block.name || 'IAR',
                page: 'Settings',
                type: 'Simple Card'
            });
            break;
        case 'IAR_VIEW_ALL':
            navigateToList(api, 'sys_cs_auto_resolution_simulation_configuration',{'aceNav':'virtual-agent'});
            break;

        case 'REQUEST_AIS':
            api.data.ci_request_ai_search_1.execute();
            break;

        case 'NOTIFICATION_TOGGLE':
            const {
                actual_event: {
                    payload: {
                        value
                    }
                }
            } = eventPayload;

            api.data.toggle_notification.execute({
                table: 'sys_cs_live_agent_setup',
                recordId: 'f0acbc4c5f091300e6333654de7313c8',
                templateFields: 'notification_enabled=' + value,
                useSetDisplayValue: null
            });
            break;

        case 'MULTIPLE_ACTIVE_CONVERSATIONS_VIEW_SETTINGS':
            api.emit('NAV_ITEM_SELECTED', {
             route: 'multiple-active-conversation',
             params: {
               t: Date.now(),
               'aceNav':'virtual-agent'
            },
            fields: null,
            external: null
           });
           break;

        case 'BUTTON_CLICKED#EXTERNAL_URL_NAVIGATION':
            const {
                key
            } = props_details;
            let eventName = '';
            if (key == 'NOTIFICATIONS_VIEW_ALL') {
                eventName = 'CI - Settings Nav - Notifications';
            } else if (key == 'DEFLECTION_METRICS_VA_ANALYTICS') {
                eventName = 'CI - Settings Nav - VA Analytics';
            } else if (key == 'NLU_WORKBENCH'){
                eventName = 'CI - Settings Nav - NLU workbench';
            } else if (key == 'TOPIC_RECOMMENDATIONS') {
                eventName = 'CI - Settings Nav - Topic Recommendations';

            }
            if (eventName) {
                trackUsage(eventName, {
                    title: name,
                    link: props_details.link,
                    type: 'Simple Card'
                });
            }
            break;

    }

    function navigateToList(api, table, params) {
        navigateToRoute(api, 'list', {
            'table': table
        }, params);
    }

    function navigateToRoute(api, route, fields, params) {
        api.emit('NAV_ITEM_SELECTED', getNavPayload({
            route: route,
            fields: fields,
            params: params || {}
        }));
    }

    function getNavPayload({
        route,
        fields,
        params
    }) {
        if (!params) {
            params = {};
        }
        if (!params.t) {
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
