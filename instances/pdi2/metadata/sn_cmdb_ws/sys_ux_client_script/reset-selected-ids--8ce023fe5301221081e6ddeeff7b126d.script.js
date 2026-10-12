/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
      const {
        getSelectedItemsIds
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const {selectedItems} = api.state.userPreferenceProps;
    api.setState('userPreferenceProps', ({currentValue}) => {
      return {
        ...currentValue,
        ['selectedIds'] : getSelectedItemsIds(selectedItems)
      };
    });

}
