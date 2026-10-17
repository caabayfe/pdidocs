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
    const result = api.data.get_related_items?.output?.relatedItems || [];
    const userPreferenceObj = api.data.look_up_user_preferences?.result?.preferences[0] || {};
    const userPreferenceRelatedItems = userPreferenceObj.value ? JSON.parse(userPreferenceObj.value): null;
    const {
        getAvailableItems,
        getSelectedItems,
        getRelatedItems,
        getSelectedItemsIds,
        getRelatedItemsEmptyStateProps
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const relatedItems = await getRelatedItems(result, userPreferenceRelatedItems);
    const selectedItems = getSelectedItems(result, userPreferenceRelatedItems);
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
            ['availableItems']: getAvailableItems(result),
            ['selectedItems']: selectedItems,
            ['selectedIds']: getSelectedItemsIds(selectedItems)
        }
    });
    api.setState("relatedItems", relatedItems);
}
