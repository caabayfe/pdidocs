/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        RELATED_ITEMS_USER_PREFERENCE,
        getSelectedItems,
        getRelatedItems,
        getRelatedItemsEmptyStateProps
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    
    const {selectedIds, selectedItems} = api.state.userPreferenceProps;
    const result = api.data.get_related_items?.output?.relatedItems || [];
    let relatedItems = await getRelatedItems(result, selectedIds);
    api.setState('relatedItems', relatedItems);
    const emptyStateProps= await getRelatedItemsEmptyStateProps(result, relatedItems);

    api.setState('relatedItemEmptyStateProps', ({currentValue}) => {
        return {
            ...currentValue,
            ['hideEmptyState']: emptyStateProps['hideEmptyState'],
            ['HEADING']: emptyStateProps['HEADING'],
            ['CONTENT']: emptyStateProps['CONTENT']
        }
    });    
    api.setState('userPreferenceProps', ({currentValue}) => {
        return {
            ...currentValue,
            ['selectedItems']: [...getSelectedItems(result, selectedIds)]
        }
    });
    api.setState('relatedItemEmptyStateProps',  await getRelatedItemsEmptyStateProps(result, relatedItems));
    api.data.save_user_preference.execute({"name": RELATED_ITEMS_USER_PREFERENCE, "value":  JSON.stringify(selectedIds)});
    helpers.modal.close();
}
