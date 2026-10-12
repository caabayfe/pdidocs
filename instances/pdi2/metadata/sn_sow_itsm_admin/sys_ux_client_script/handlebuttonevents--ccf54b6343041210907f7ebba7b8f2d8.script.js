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
    var blockcontext = await aceUtils.getContext();
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "tier1-preview-migration-button-clicked") {
        if (blockcontext.tier1MigrationStatus == "not-previewed") {
            if (blockcontext.areTier1DonutsCustomized) {
                var tier1LandingPageUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
                blockcontext.tier1Config = {
                    yourWorkDonutConfig: await tier1LandingPageUtils.getDonutConfig(helpers, "your_work", 0, api),
                    yourTeamWorkDonutConfig: await tier1LandingPageUtils.getDonutConfig(helpers, "your_team_work", 0, api)
                }
            }
            await aceUtils.refreshContentBlock("migrate_tier1_dashboard");
        }
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/f671f450477bca5096bc6095d36d43d7"
            }
        });
    } else if (eventName == "tier2-preview-migration-button-clicked") {
        if (blockcontext.tier2MigrationStatus == "not-previewed") {
            if (blockcontext.areTier2DonutsCustomized) {
                var tier2LandingPageUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
                blockcontext.tier2Config = {
                    yourWorkDonutConfig: await tier2LandingPageUtils.getDonutConfig(helpers, "your_work", 0, api),
                    yourTeamWorkDonutConfig: await tier2LandingPageUtils.getDonutConfig(helpers, "your_team_work", 0, api)
                }
            }
            await aceUtils.refreshContentBlock("migrate_tier2_dashboard");
        }
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/fcbe50e8473f0e5096bc6095d36d43d6"
            }
        });
    } else if (eventName == "migrate-button-clicked") {
        await aceUtils.refreshContentBlock("switch_to_par_variant");
        aceUtils.dismissModal("2529-bdf0-bb9989-b912-9b8b19b9"); // dismiss migrate chart modal
    } else if (eventName == "migrate-chart-modal-cancel-clicked") {
        aceUtils.dismissModal("2529-bdf0-bb9989-b912-9b8b19b9"); // dismiss migrate chart modal
    }
}
