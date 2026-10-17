/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // // note we repalced periods with &#46; due to it causing an error in the select component. need to put the period back after selection.
    let selected = Array.prototype.map.call(event.payload, i => i[0].id).toString().replaceAll('&#46;','.');
    let newMergeRelatedItem = JSON.parse(JSON.stringify(api.state.newMergeRelatedItem));
    newMergeRelatedItem.items = selected;
    if(api.data.de_duplication_template_merge_related_item_enhanced_property_enabled.output) {
    let relatedTableConfigs = api.data.de_duplicate_get_related_table_configs.output;
    let selectedArray = selected.split(',').map(item => item.trim());
    api.setState('relatedTableConfigSelected', relatedTableConfigs.filter(item => {
        let tableName = item.tableName;
        return selectedArray.some(selectedItem => {
            let selectedTable = selectedItem.split('.')[0];
            return tableName === selectedTable;
        });
    }));
    }
    api.setState('newMergeRelatedItem',newMergeRelatedItem);

}
