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
        output
    } = api.data.fetch_theme_asset_record_details;
    const listItems = [];
    
    output.forEach((themeAsset) => {
        listItems.push({
            id: `/uxta/${themeAsset.sys_id}.assetx`,
            label: themeAsset.name
        });
    });
    api.setState('fontAssetListItems', listItems);
}
