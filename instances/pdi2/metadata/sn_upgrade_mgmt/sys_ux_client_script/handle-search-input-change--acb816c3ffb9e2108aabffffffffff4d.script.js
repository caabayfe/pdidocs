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
    var fieldValue = event?.payload?.fieldValue;

    function isScopedComponentPath(str) {
        const regex = /^@[a-z0-9_]+\/[a-z0-9_]+(?:-[a-z0-9_]+)*$/;
        return regex.test(str);
    }

    const isScopedComponentPathVal = isScopedComponentPath(fieldValue||"");
    const fieldValueWithSpace = " " + fieldValue;
    const value = isScopedComponentPathVal ? fieldValueWithSpace : fieldValue;

    if (api.state.searchText && !value) {
        api.setState("page", 0);
        api.setState("rowData", api.state.origRowData);
        api.setState("displayedSearchText", "");
    }

    api.setState("searchText", value);
}
