/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {item, selected} = event.payload;
    let {selectedIds}= api.state.userPreferenceProps;
    if (selected)
        selectedIds.push(item[0]['id']);
    else {
         selectedIds = selectedIds.filter((selectedId) => {
            return item[0]['id'] != selectedId;
         });
    }
    api.setState('userPreferenceProps', ({currentValue}) => {
        return {
            ...currentValue,
            ['selectedIds'] : selectedIds
        };
    });

}
