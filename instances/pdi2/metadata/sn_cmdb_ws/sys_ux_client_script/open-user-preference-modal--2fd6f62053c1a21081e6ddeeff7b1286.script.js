/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {selectedItems} = api.state.userPreferenceProps;
    api.setState('userPreferenceProps', ({currentValue}) => {
      return {
        ...currentValue,
        ['selectedItems'] : [...selectedItems]
      };
    });
    helpers.modal.open('user_pref_modal');
}
