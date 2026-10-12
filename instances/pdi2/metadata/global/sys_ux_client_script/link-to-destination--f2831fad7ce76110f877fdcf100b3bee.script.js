/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var home_info = api.data.get_home_info.output;
    
    // Learn about VA link
    if (event.elementId === 'docs_link') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/api/now/v1/context_doc_url/auto_resolution'
            }
        });
    }
    // Go to community forums link
    else if (event.elementId === 'forums_link') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'https://community.servicenow.com/community?id=community_forum&sys_id=bf5abf94db54e3c42be0a851ca961915'
            }
        });
    }
    // Go to simulations link
    else if (event.elementId === 'run_simulation_link') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'now/conversation/iar/simulation/home'
            }
        });
    }
    // Go to app store link
    else if (event.elementId === 'app_store_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/31f5f491c3a710100bf407720f40ddf4/6.2.2?referer=%2Fstore%2Fsearch%3Flistingtype%3Dallintegrations%25253Bancillary_app%25253Bcertified_apps%25253Bcontent%25253Bindustry_solution%25253Boem%25253Butility%25253Btemplate%26q%3Dnlu%2520workbench&sl=sh'
            }
        });
    }

    // Carousel Buttons

    // IAR for HR
    else if (event.elementId === 'hr_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: home_info.sn_iar_hr
                    ? '/now/conversation/iar/settings'
                    : 'https://store.servicenow.com/$appstore.do#!/store/application/3eefb89bdc38cd50f87747162048c37b'
            }
        });
    }
    // IAR for ITSM
    else if (event.elementId === 'itsm_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: home_info.sn_itsm_va
                    ? '/now/conversation/iar/settings'
                    : 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/134450a0b3781300787162ac16a8dc1e'
            }
        });
    }
    // Install VA
    else if (event.elementId === 'install_va_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/app-manager/home/plugin/id/com.glide.cs.chatbot/details'
            }
        });
    }
    // Manage VA
    else if (event.elementId === 'manage_va_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/nav/ui/classic/params/target/sp_agent_chat_config_list.do'
            }
        });
    }
    // Notifications
    else if (event.elementId === 'notifications_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/conversation/settings/virtual-agent/params/ace-nav/virtual-agent'
            }
        });
    }
    // AI Search
    else if (event.elementId === 'ais_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/nav/ui/classic/params/target/ais_status.do'
            }
        });
    }
    // Twilio
    else if (event.elementId === 'twilio_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/app-manager/home/plugin/id/com.snc.notify.twilio_direct/details'
            }
        });
    }
    // Teams
    else if (event.elementId === 'teams_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/8be385e4776110105d7b3882a910610e'
            }
        });
    }
    // Slack
    else if (event.elementId === 'slack_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/a2f8b3a0772110105d7b3882a9106160'
            }
        });
    }
}
