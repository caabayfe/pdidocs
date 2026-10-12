/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("UpgradeViewport", Math.random());
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED",{
        "viewportElementId": "viewport_1",
        "route": "overview",
    });
    if (api.state.patch) {
        api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED",{
            "viewportElementId": "viewport_2",
            "route": "playbook-vertical-focused",
            "fields": {
                "table": "sn_um_upgrade_sessions",
                "sysId": api.state.patch,
                "currentVersion": api.state.currentVersion,
                "targetVersion": api.state.targetVersion
            },
            "params": {
                "experience": "68a44ca29f1312106548971b8a0a1ce2"
            }
        });
    }
    if (api.state.bulkPatch) {
        if (api.state.activeTab === "guided_app_update") {
            api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED",{
                "viewportElementId": "viewport_3",
                "route": "guided-app-update",
                "fields": {
                    "table": "sn_um_upgrade_sessions",
                    "sysId": api.state.bulkPatch,
                    "sessionType": "bulk_app_update"
                },
                "params": {
                    "experience": "68a44ca29f1312106548971b8a0a1ce2"
                }
            });
               // Set page title using Promise .then() chaining
            helpers.translate("Guided App Update").then(function(guidedLabel) {
                helpers.translate("Upgrade Console").then(function(consoleLabel) {
                    var pageTitle = guidedLabel + "|" + consoleLabel;
                    api.emit("UNIFIED_NAVIGATION#PAGE_TITLE_UPDATE_REQUESTED_RELAY_120d4be69f0012107e91971b8a0a1cd5", {
                        label: pageTitle,
                        bypassExperienceTitle: true
                    });
                    // Retry
                    helpers.timing.setTimeout(function() {
                        api.emit("UNIFIED_NAVIGATION#PAGE_TITLE_UPDATE_REQUESTED_RELAY_120d4be69f0012107e91971b8a0a1cd5", {
                            label: pageTitle,
                            bypassExperienceTitle: true
                        });
                    }, 500);
                });
            });
        }
    } else {
        api.data.in_progress_bulk_app_update_session?.refresh();
    }
}
