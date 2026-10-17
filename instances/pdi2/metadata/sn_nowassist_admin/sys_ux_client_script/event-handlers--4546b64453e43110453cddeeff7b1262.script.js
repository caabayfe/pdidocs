/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const {
        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = { ...eventPayload.blockcontext
    };

    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }

    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    const NOW_ASSIST_ADMIN_ONBOARDING_ADMIN_JOURNEY = '19ad-b9e3-abbaa9-bca9-abba3a99';
    const REFRESH_MODAL = 'bf22-e923-a98a99-1ab8-99891489';
    const NOW_ASSIST_CHECKLIST = '4fcd-cf18-aa8b9a-0fc3-ba8af6ba';
    const FEEDBACK_MODAL = 'a560-770d-99a898-c16b-a9bb419b';
    switch (eventName) {
        case "GET_STARTED#CLICKED":
            blockcontext.showOnboardingAdminJourneyContainer = false;
            publish();
            aceUtils.dismissModal('NOW_ASSIST_ADMIN_ONBOARDING_ADMIN_JOURNEY');
            aceUtils.refreshContentBlock('set_user_preference');
            break;
        case "INSTALL#CLICKED":
            navigateTo("https://store.servicenow.com/sn_appstore_store.do#!/store/search?q=sn_now_creator", "_blank");
            aceUtils.openModal(REFRESH_MODAL);
            trackUsage('Install clicked', {
                plugin: 'sn_now_creator'
            });
            break;
        case "REFRESH#CLICKED":
            aceUtils.dismissModal(REFRESH_MODAL);
            navigateTo("/now/now-assist-admin/home", "_self");
            break;
        case "DONE#CLICKED":
            aceUtils.dismissModal(NOW_ASSIST_CHECKLIST)
            break;
        case "BROWSE_PLUGIN#CLICKED":
            trackUsage('Clicked Browse Plugin', {
                workflow: eventPayload?.item?.name,
                cardTitle: 'Install product plugins'
            });
            break;
        case "LEARN_MORE_NAP#CLICKED":
            trackUsage('Clicked Learn more', {
                cardTitle: 'Turn on Now Assist panel'
            });
            break;
        case "LEARN_MORE_WWNA#CLICKED":
            trackUsage('Clicked Learn more', {
                cardTitle: 'Manage Now Assist context menu'
            });
            break;
        case "NAA_JOURNEY_CHECKLIST_#CLICKED":
            trackUsage('Clicked View checklist', {
                cardTitle: 'Your Now Assist journey'
            });
            break;
        case "LEARN_MORE_CE#CLICKED":
            trackUsage('Clicked Learn more', {
                cardTitle: 'Explore Conversational experiences skills'
            });
            break;
        case "GET_PLUGIN#CLICKED":
            trackUsage('Get Plugin clicked', {
                plugin: 'sn_now_creator',
                cardTitle: 'Empower your Developers'
            });
            break;
        case "NAA_OVERVIEW_HR#CLICKED":
            trackUsage('Clicked Helpful Resources', {
                title: 'Now Assist Admin overview'
            });
            break;
        case "NAP_OVERVIEW_HR#CLICKED":
            trackUsage('Clicked Helpful Resources', {
                title: 'Now Assist Panel overview'
            });
            break;
        case "AI_INT_COMM_HR#CLICKED":
            trackUsage('Clicked Helpful Resources', {
                title: 'AI & Intelligence community'
            });
            break;
        case "SN_GEN_AI_OVERVIEW_HR#CLICKED":
            trackUsage('Clicked Helpful Resources', {
                title: 'ServiceNow Generative AI overview'
            });
            break;
        case "SN_SYSADM_FORUM_HR#CLICKED":
            trackUsage('Clicked Helpful Resources', {
                title: 'ServiceNow SysAdmin forum'
            });
            break;
        case "NEEDED_PLUGINS_FAQ#EXPANDED":
            trackUsage('Opened FAQ', {
                title: 'What plugins do I need?'
            });
            break;
        case "NA_FEATURES_SKILLS_FAQ#EXPANDED":
            trackUsage('Opened FAQ', {
                title: 'What are Now Assist Features and skills?'
            });
            break;
        case "SN_OWN_LLM_FAQ#EXPANDED":
            trackUsage('Opened FAQ', {
                title: 'Does ServiceNow have its own LLM?'
            });
            break;
        case "PLUGINS_NOT_INSTALLED#CLICKED":
            trackUsage('Clicked Plugins not installed', {
                plugin: eventPayload?.item?.name,
                cardTitle: 'Needs Attention'
            });
            break;
        case "SKILLS_NOT_ACTIVATED#CLICKED":
            trackUsage('Clicked Skills not activated', {
                plugin: eventPayload?.item?.name,
                cardTitle: 'Needs Attention'
            });
            break;
        case "DRAFT_SKILLS#CLICKED":
            trackUsage('Clicked Skills in draft state', {
                plugin: eventPayload?.item?.name,
                cardTitle: 'Needs Attention'
            });
            break;
        case "SKILLS_NOT_CONFIGURED#CLICKED":
            trackUsage('Clicked Skills not configured', {
                plugin: eventPayload?.item?.name,
                cardTitle: 'Needs Attention'
            });
            break;
        case "ADD_FDBK#VALUE_SET":
            blockcontext.additionalFeedback = eventPayload?.value;
            publish();
            break;
        case "SUBMIT_FEEDBACK#CLICKED":
            await aceUtils.refreshContentBlock('submit_feedback');
            aceUtils.dismissModal('FEEDBACK_MODAL');
            if(blockcontext.feedbackSubmitted){
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items:[{
                        id: "feedback_successful_alert",
                        status: "positive",
                        icon: "circle-check-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Thank you for your feedback")
                        },
                        action: {
                            type: 'dismiss'
                        },
                        enableFocus:true
                    }]
                });
            }
            else{
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items:[{
                        id: "feedback_failure_alert",
                        status: "critical",
                        icon: "circle-exclamation-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Some error occurred while saving the feedback")
                        },
                        action: {
                            type: 'dismiss'
                        },
                        enableFocus: true
                    }]
                });
            }
            break;
    }

    function navigateTo(url, target) {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: url,
                target: target
            }
        });
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
