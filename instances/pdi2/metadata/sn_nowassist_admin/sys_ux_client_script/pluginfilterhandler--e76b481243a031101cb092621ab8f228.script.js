function handler({
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
    switch (eventName) {
        case "FILTER_ITEM#SELECTED":
            api.emit('NAV_ITEM_SELECTED',{
                route: 'plugins',
                params: {
                    workflow: eventPayload.item.id || "all",
                    t: Date.now()
                }
            })
            break;
        case "LG#ACTION_BUTTON_CLICKED":
            blockcontext.InstallPluginModalHeader = eventPayload.item.name;
            blockcontext.PluginID = eventPayload.item.pluginId;
            publish();
            aceUtils.refreshContentBlock('translate_modal_header').then(() => {
                aceUtils.openModal('3eee-9fc5-98abab-ac20-99aac09b');
            });
            trackUsage('Get Plugin Button',{plugin : blockcontext.PluginID});
            break;
        case "REFRESH#CLICKED":
            aceUtils.refreshContentBlock('is_nap_enabled_and_is_plugin_active').then(() => {
                aceUtils.getContext().then((context) => {
                    blockcontext = context;
                    if (blockcontext.isPluginInstalled) {
                        aceUtils.openModal('9cbb-7a99-989988-4522-a9abb69a');
                    } else {
                        navigateTo("now/now-assist-admin/plugins/params/workflow/" + blockcontext.AvailablePluginsSelectedFilterItem, "_self");
                    }
                })
            })
            break;
        case "INSTALL#CLICKED":
            aceUtils.refreshContentBlock('get_plugin_store').then(() => {
                aceUtils.getContext().then((context) => {
                    blockcontext = context;
                    navigateTo(blockcontext.pluginStoreLink + blockcontext.PluginID, "_blank");
                    aceUtils.openModal("b353-5323-a99988-cd6a-bab92999");
                });
            });
            trackUsage('Install Plugin Button', {plugin : blockcontext.PluginID}); 
            break;
        case "PLUGIN_INSTALLED#CLICKED":
            navigateTo(blockcontext.navigationURL, "_self");
            break;
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }

    function navigateTo(url, target) {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: url,
                target: target
            }
        });
    }



}
