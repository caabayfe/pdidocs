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
    const minimumLengthOfSearchString = 3;
    let searchString = event && event.payload && event.payload.value || '';
    if (searchString.length >= minimumLengthOfSearchString) {
        api.setState('userSearchString', searchString);
        api.data.look_up_user_records.refresh();
    }
}
