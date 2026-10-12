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

    const SN_SOW_ITSM_COMMON_SCOPE = "0eef12637311301045216238edf6a75e";
    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    var blockcontext = await aceUtils.getContext();

    if (eventName == "switch-scope-clicked") {
        await switchScope(SN_SOW_ITSM_COMMON_SCOPE);
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "now/sow-admin/chart-migration",
                target: '_self'
            }
        });
    } else if (eventName == "preview-migration-dismiss-alert-clicked") {
        blockcontext.showPreviewMigrationAlert = false;
        aceUtils.setContext(blockcontext);
    } else if (eventName == "chart-migrated-dismiss-alert-clicked") {
        blockcontext.showChartsMigratedAlert = false;
        aceUtils.setContext(blockcontext);
    }

    async function switchScope(appSysId) {
        await helpers.snHttp('/api/now/ui/concoursepicker/application', {
            method: 'PUT',
            batch: false,
            body: {
                app_id: appSysId
            }
        });
    }

}
