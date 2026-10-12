/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.state.impactRelatedListSectionDetails.selectedImpactRelatedList.id == "task_ci-task_ci.task.ci_has_assets") {
        const assetActionColUpdated = event.payload.multiRowInlineValue.some(row => {
            return row.column == "asset_action" || row.column == "swapped_ci";
        });
        if(assetActionColUpdated) api.data.incomplete_asset_actions.refresh();
    }
}
