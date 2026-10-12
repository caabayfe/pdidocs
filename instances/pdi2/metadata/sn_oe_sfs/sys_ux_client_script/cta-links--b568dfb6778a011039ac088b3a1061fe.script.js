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
    if (event.elementId === 'skip_button') {
        event.payload.eventName = "ACE_CHECKLIST_ITEM#ITEM_SKIPPED";
        helpers.modal.close('check_list_modal');
        api.setState('hideModal', true);
        const ccSkipPayload = api.state.itemPayload;
        ccSkipPayload.value.status = "skip";
        api.setState('itemPayload', {...ccSkipPayload});
        event.payload.eventPayload = {...ccSkipPayload};
    }
    if (event.elementId === 'main_button') {
        event.payload.eventName = "ACE_CHECKLIST_ITEM#ITEM_CLICKED";
        helpers.modal.close('check_list_modal');
        api.setState('hideModal', true);
        const ccCompletedPayload = api.state.itemPayload;
        ccCompletedPayload.value.status = "complete";
        api.setState('itemPayload', {...ccCompletedPayload});
        event.payload.eventPayload = {...ccCompletedPayload};
    }
    if (event.elementId === 'get_started' || event.elementId === 'manage_assistants') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/conversational-studio/assistants/all',
                target:'_self'
            }
        });
    }
    if (event.elementId === 'view_performance') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/conversation/settings/nowassist-va-analytics',
                target:'_self'
            }
        });
    }
    const {
        eventName,
        eventPayload
    } = event.payload;

    const getParentBlockId = (blocks, childBlockId) => {
        const parentBlockId = (blocks = [], parentBlock = {}) => {
            for (const cb of blocks) {
                if (cb.block_id === childBlockId) {
                    return parentBlock.block_id;
                }
                if (cb.children && cb.children.length > 0) {
                    const ans = parentBlockId(cb.children, cb);
                    if (ans !== -1) return ans;
                }
            };
            return -1;
        };
        return parentBlockId(blocks);
    };
    const getCardIdFromActionId = (actionId) => {
        const screenId = getParentBlockId(api.data.ace_fetch_content_blocks.output, actionId);
        const cardId = getParentBlockId(api.data.ace_fetch_content_blocks.output, screenId);
        return cardId;
    };

    const updateLastReviewedOnInCard = () => {
        const actionId = event.payload.eventPayload.content_block.block_id;
        const screenId = getParentBlockId(api.data.ace_fetch_content_blocks.output, actionId);
        const cardId = getParentBlockId(api.data.ace_fetch_content_blocks.output, screenId);

        updateLastReviewedOn(cardId);
    };

    const updateLastReviewedOnInScreen = () => {
        const actionId = event.payload.eventPayload.content_block.block_id;
        const screenId = getParentBlockId(api.data.ace_fetch_content_blocks.output, actionId);

        updateLastReviewedOn(screenId);
    };

    const updateLastReviewedOn = (blockId) => {
        const {
            getCurrentDateTime
        } = imports["sn_oe_sfs.CTACardsUtil"]();
        const lastActionOn = getCurrentDateTime();
        api.data.update_ace_record.execute({
            recordId: blockId,
            fields: {
                'last_reviewed_on': lastActionOn,
                'last_action_on': lastActionOn
            }
        });
    };

    const updateProgressCardStatus = (blockId, status) => {
        if (!blockId || !status) return;
        api.data.update_ace_record.execute({
            recordId: blockId,
            fields: {
                'status': status
            }
        });
    };

    const translations = api.data.ci_landing_page_data.output || {};
    const PROGRESS_CARD_CONSTANTS = {
        'REMAINING': translations['remaining'] || 'remaining',
        'ACHIEVED': translations['achieved'] || 'Achieved',
        'PROGRESS_TEXT': [{
                'range': [0, 20],
                'label': translations['good_start'] || 'Off to a good start!'
            },
            {
                'range': [21, 80],
                'label': translations['keep_it_up'] || 'Let\'s keep it up!'
            },
            {
                'range': [81, 99],
                'label': translations['almost_there'] || 'Almost there!'
            },
            {
                'range': [100, 100],
                'label': translations['your_a_machine'] || 'Your a machine!'
            }
        ]
    };

    const _getRemainingStatusCount = (items) => {
        var count = {
            'total': 0,
            'remaining': 0
        };
        try {
            if (!items) return count;
            var remainingCount = 0;
            items.forEach(function(item) {
                if (item.props_details && item.props_details.status)
                    count.remaining += item.props_details.status == 'start' ? 1 : 0;
                count.total += 1;
            });
            return count;
        } catch (e) {
            return count;
        }
    };

    const getChecklistCardItemStatus = (items) => {
        var pConstants = PROGRESS_CARD_CONSTANTS;
        var status = _getRemainingStatusCount(items);
        var response = status.remaining == 0 ? {
            'badge_color': 'positive',
            'badge_label': pConstants.ACHIEVED
        } : {
            'badge_color': 'info',
            'badge_label': status.remaining + ' ' + pConstants.REMAINING
        };
        return response;
    };

    const _getProgressText = (remaining, total) => {
        var pConstants = PROGRESS_CARD_CONSTANTS;
        var progressTextMap = pConstants.PROGRESS_TEXT;
        var completed = total - remaining;
        var percentageCompleted = parseInt(completed / total * 100);
        progressTextMap.forEach(function(progressRange) {
            if (percentageCompleted >= progressRange.range[0] && percentageCompleted <= progressRange.range[1]) return progressRange.label;
        });
        return progressTextMap[0].label;
    };

    const getChecklistCardStatus = (items) => {
        var cardCount = {
            'total': 0,
            'remaining': 0,
            'progress_text': null
        };
        items.forEach(function(item) {
            var eachItemStatus = _getRemainingStatusCount(item.children);
            cardCount.total += eachItemStatus.total;
            cardCount.remaining += eachItemStatus.remaining;
        });
        cardCount.progress_text = _getProgressText(cardCount.remaining, cardCount.total);
        return cardCount;
    };

    const sortChecklistCardItems = function(block1, block2) {
        if (block1.props_details.status === block2.props_details.status) return parseInt(block1.order) - parseInt(block2.order);
        if (block1.props_details.status === 'skip') return 1;
        if (block2.props_details.status === 'skip') return -1;
        if (block1.props_details.status === 'complete') return 1;
        if (block2.props_details.status === 'complete') return -1;
    };

    const updateAceContentBlocks = (status, cbId, parentCbId) => {
        const aceContentBlocks = api.state.aceContentBlocks;
        aceContentBlocks.forEach(function iter(item, idx) {
            if (item.block_id == cbId) {
                item.props_details.status = status;
            }
            Array.isArray(item.children) && item.children.forEach(iter);
            if (item.block_id == parentCbId && item.type.route === "ci-checklist-card")
                item.children.sort(sortChecklistCardItems);
        });
        aceContentBlocks.forEach(function iter(item) {
            if (item.block_id == parentCbId) {
                var response = getChecklistCardItemStatus(item.children);
                item.badgeColor = response.badge_color;
                item.badgeLabel = response.badge_label;
            } else if (item.block_id == '0f75a415c35301104b8e88c7c840ddd6') {
                var res = getChecklistCardStatus(item.children);
                item.progressText = res.progress_text;
                item.badgeLabel = (res.total - res.remaining) + '/' + res.total + (translations['completed'] || ' Completed');
                item.badgeColor = 'blue';
            }
            Array.isArray(item.children) && item.children.forEach(iter);
        });
        api.setState('aceContentBlocks', JSON.parse(JSON.stringify(aceContentBlocks)));
    };

    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);
    const {
        title: cbTitle,
        props_details,
        block_id
    } = eventPayload.content_block || {};
    switch (eventName) {
        case 'ACE_CHECKLIST_ITEM#ITEM_UNDO_PERFORMED':
            updateProgressCardStatus(eventPayload.value.value.block_id, 'start');
            updateAceContentBlocks('start', eventPayload.value.value.block_id, eventPayload.value.parent.value.block_id);
            break;
        case 'ACE_CHECKLIST_ITEM#ITEM_START_PERFORMED':
            const {
                value: itemPayload
            } = eventPayload;
            api.setState('itemPayload', itemPayload);
            helpers.modal.open('check_list_modal');
            api.setState('hideModal', false);
            const {
                title: itemTitle
            } = itemPayload.value || {};
            const {
                title: parentTitle,
            } = itemPayload.parent.value || {};
            const eventName = 'CI - Progress Clicks - ' + parentTitle;
            trackUsage(eventName, {
                title: itemTitle,
            });
            break;
        case 'ACE_CHECKLIST_ITEM#ITEM_SKIPPED':
            {
                const {
                    record,
                    block_id: itemBlockId,
                    title: itemTitle
                } = eventPayload.value || {};
                const {
                    title: parentTitle,
                    block_id: parentBlockId
                } = eventPayload.parent.value || {};
                updateProgressCardStatus(record, 'skip', );
                updateAceContentBlocks('skip', itemBlockId, parentBlockId);
                const eventName = 'CI - Progress Skipped - ' + parentTitle;
                trackUsage(eventName, {
                    title: itemTitle,
                });
                break;
            }
        case 'ACE_CHECKLIST_ITEM#ITEM_CLICKED':
            {
                const {
                    endpoint,
                    record,
                    block_id: itemBlockId,
                    title: itemTitle,
                    ciEndpointDetails,
                    openInNewTab
                } = eventPayload.value || {};
                const {
                    title: parentTitle,
                    block_id: parentBlockId
                } = eventPayload.parent.value || {};
                if(endpoint || ciEndpointDetails){
                    updateProgressCardStatus(record, 'complete');
                    updateAceContentBlocks('complete', itemBlockId, parentBlockId);
                    const eventName = 'CI - Progress Completed - ' + parentTitle;
                    trackUsage(eventName, {
                        title: itemTitle,
                    });
                    if(openInNewTab && endpoint){
                        api.emit('NAV_ITEM_SELECTED', {
                            external: {
                                url: endpoint
                            }
                        });
                    }
                    if(!openInNewTab && ciEndpointDetails){
                        const {route, fields, params } = ciEndpointDetails;
                        navigateToRoute(api, route, fields, params);
                    }
                }
                break;
            }
        case 'VIEW_BRANDING_SETTINGS':
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Brand your bot', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToList(api, 'sys_cs_branding_setup',{"aceNav":"general"});
            }, 100);

            break;
        case 'VIEW_CUSTOM_GREETINGS_SETTINGS':
            updateLastReviewedOnInCard();
            trackUsage("CI - CTA Nav - Create your bot's greeting", {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToList(api, 'sys_cs_context_profile', {
                    'view': 'simple_chat_context_profiles',
                    't': Date.now(),
                    "aceNav":"virtual-agent"

                });
            }, 100);
            break;
        case 'VIEW_PROFANITY_FILTER_SETTINGS':
            trackUsage('CI - CTA Nav - Get Profanity Filter', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            navigateToRoute(api, 'profanity-settings','',{"aceNav":"agent-chat"});
            break;
        case 'VIEW_CHANNEL_INTEGRATIONS':
            trackUsage('CI - CTA Nav - Add your bot to other channels', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            navigateToRoute(api, 'channel-settings','',{"aceNav":"general"});
            break;
        case 'VIEW_AGENT_CHAT_SETTINGS':
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Setup Agent Chat', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'agent-chat','',{"aceNav":"agent-chat"});
            }, 100);

            break;
        case 'VIEW_NLU_SETTINGS':
            updateLastReviewedOnInScreen();
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Set up your NLU', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'nlu-setting','',{'aceNav':"virtual-agent"});
            }, 100);
            break;
        case 'VIEW_IVR_SETTINGS':
            updateLastReviewedOnInScreen();
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Set up Virtual Agent for IVR', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });

            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'configure-cc','',{'aceNav':"virtual-agent"});
            }, 100);
            break;
        case 'VA_ANALYTICS_VIEW_ALL':
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Capture conversational metrics', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: '/now/conversation/settings/overview'
                    }
                });
            }, 100);
            break;

        case 'VIEW_DT_AC_SETTINGS':
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Setup Dynamic Translation AC', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'agent-chat','',{'aceNav':'agent-chat'});
            }, 100);
            break;
        case 'VIEW_DT_VA_SETTINGS':
            updateLastReviewedOnInCard();
            trackUsage('CI - CTA Nav - Setup Dynamic Translation VA', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'virtual-agent','',{'aceNav':'virtual-agent'});
            }, 100);
            break;
        case 'REVIEW_NLU_SETTINGS':
            trackUsage('CI - CTA Nav - Set up your NLU', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            updateLastReviewedOnInScreen();
            updateLastReviewedOnInCard();

            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'nlu-setting','',{'aceNav':'virtual-agent'});
            }, 100);
            break;
        case 'VIEW_OMNI_CHANNEL_CALLBACK':
            trackUsage('CI - CTA Nav - Callback', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            updateLastReviewedOnInScreen();
            updateLastReviewedOnInCard();

            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'omnichannel-callback','',{'aceNav':'virtual-agent'});
            }, 100);
            break;
        case 'GET_PROFANITY_FILTER_PLUGIN':
            navigateToRoute(api, 'agent-chat','',{'aceNav':'agent-chat'});
            break;
        case 'VIEW_IAR_SETTINGS':
            trackUsage('CI - CTA Nav - Setup issue auto resolution', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: '/now/conversation/iar/home'
                }
            });
            break;
        case 'VIEW_SIDEBAR_SETTINGS':
            trackUsage('CI - CTA Nav - Sidebar', {
                title: cbTitle,
                page: 'Home',
                type: 'CTA Card'
            });
            updateLastReviewedOnInScreen();
            updateLastReviewedOnInCard();

            helpers.timing.setTimeout(function() {
                navigateToRoute(api, 'side-bar','',{'aceNav':'side-bar'});
            }, 100);
            break;
        case 'CI_DROPDOWN_SELECTED':
            const {
                payload
            } = eventPayload.actual_event;
            const {
                label,
                id,
                value
            } = payload.item;
            const {
                start_date,
                end_date
            } = value;
            trackUsage('CI - Change Date range - Metric Dashboard', {
                title: label,
                id: id,
                startDate: start_date,
                endDate: end_date
            });
            const _lazyBlockIds = ['1ae28f5353920110d365ddeeff7b1208',
                'e6f4cfd353920110d365ddeeff7b1224',
                '0d56035753920110d365ddeeff7b123b',
                'fbd60b5753920110d365ddeeff7b12ed'
            ];
            _lazyBlockIds.forEach(blockId => {
                api.data.lazy_load.execute({
                    blockId: blockId,
                    pageParams: {
                        startDate: eventPayload.dates.start_date,
                        endDate: eventPayload.dates.end_date
                    }
                });
            });
            break;

        case 'VA_PORTAL_RECORD_LINK_CLICK':
            const screenId = eventPayload.screenData.block_id;
            const cardId = getParentBlockId(api.data.ace_fetch_content_blocks.output, screenId);

            updateLastReviewedOn(cardId);
            helpers.timing.setTimeout(function() {
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: eventPayload.link
                    }
                });
            }, 100);
            break;

        case 'PLUGIN_CARD_NOTIFICATION':
            if (event.payload.eventPayload.status == 'Successful') {
                const translations = api.data.ci_landing_page_data.output || {};
                const installationSuccessfulMsg = translations.installation_successful || 'Installation successful!.';

                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'plugin_installation_success_alert',
                        status: 'positive',
                        icon: 'check',
                        content: {
                            type: "html",
                            value: `<p> <b>${event.payload.eventPayload.pluginName}</b> ${installationSuccessfulMsg}<p>`
                        },
                        action: {
                            type: 'acknowledge',
                            label: 'OK'
                        }
                    }]
                });
            } else {
                const translations = api.data.ci_landing_page_data.output || {};
                const installationFailedMsg = translations.installation_failed || 'Install Failed!';
                const installationFailedSuffix = translations.installation_failed_suffix || 'Your installation could not complete.';
                const installationWarningMsg = translations.installation_warning_message || 'Something went wrong while tracking the progress. Please check the status';
                const installationConflictMsg = translations.installation_conflict_msg || 'Application installation is unavailable because another operation is running';
                const here = translations.here || 'here';
                const plugin_link = `/now/app-manager/home/search/${event.payload.eventPayload.pluginName}`;
                var status = event.payload.eventPayload.content.error.status;
                if (!status || status == 403 || status == 500) {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'plugin_installation_failure_warning',
                            status: 'warning',
                            icon: 'info',
                            content: {
                                type: "html",
                                value: `<p>${installationWarningMsg} <a href = "${plugin_link}" target = "_blank" style = "color:RGB(1,89,107)">${here}</a><p>`
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                } else if (status == 409) {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'plugin_installation_conflict_warning',
                            status: 'warning',
                            icon: 'info',
                            content: {
                                type: "html",
                                value: `<p>${installationConflictMsg}<p>`
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                } else {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'plugin_installation_failure_alert',
                            status: 'critical',
                            icon: 'info',
                            content: {
                                type: "html",
                                value: `<p> <b>${event.payload.eventPayload.pluginName} ${installationFailedMsg}</b> ${installationFailedSuffix}<p>`
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                }
            }
            break;

        case 'CTA_DISMISS_EVENT':
            if (eventPayload.content_block && eventPayload.content_block.block_id) {
                const {
                    updatePropsDetailsForCtaCard,
                    getCurrentDateTime,
                    shuffleCtaCards
                } = imports["sn_oe_sfs.CTACardsUtil"]();
                const currentDateTime = getCurrentDateTime();

                const dismissedCard = eventPayload.content_block;
                setDismissedOnAndLastActionOnInDB(dismissedCard, currentDateTime);

                api.setState('aceContentBlocks', ({
                    currentValue: currentContentBlocks,
                    api
                }) => {
                    updatePropsDetailsForCtaCard(currentContentBlocks, dismissedCard.block_id, { // update dismissed on and last action on to current date time for the cta card in memory
                        dismissed_on: currentDateTime,
                        last_action_on: currentDateTime
                    });
                    const updatedContentBlocks = shuffleCtaCards(currentContentBlocks);
                    return updatedContentBlocks;
                });
            }
            break;

        case 'BUTTON_CLICKED#EXTERNAL_URL_NAVIGATION':
            {
                const {
                    key,
                    link
                } = props_details;
                let eventName = '';
                switch (key) {
                    case 'SETUP_TOPIC_RECOMMENDATIONS':
                        eventName = 'CI - CTA Nav - Setup Topic Recommendations';
                        break;
                    case 'SETUP_AI_SEARCH':
                        eventName = 'CI - CTA Nav - Setup AI Search';
                        break;
                }
                if (eventName) {
                    trackUsage(eventName, {
                        title: cbTitle,
                        link: link
                    })
                }
            }
            break;
    }

    function setDismissedOnAndLastActionOnInDB(contentBlock, currentDateTime) {
        const ctaCardId = contentBlock.block_id;

        api.data.update_ace_record.execute({
            recordId: ctaCardId,
            fields: {
                'dismissed_on': currentDateTime,
                'last_action_on': currentDateTime
            }
        });
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
            reload: true,
            external: null
        };
    }
}
