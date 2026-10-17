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
    api.setState("page", 0);

    const searchText = (api.state.searchText || "").trim().toLowerCase();
    const origData = api.state.origRowData;

    api.setState("displayedSearchText", searchText);

    if (!searchText) {
        api.setState("rowData", origData);
        return;
    }

    const searchWords = searchText.split(/\s+/);

    const filteredRows = origData.rows.filter(row => {
        const name = row?.cells?.app_name?.value?.toLowerCase() || "";
        const state = row?.cells?.state?.value?.toLowerCase() || "";
        const combined = `${name} ${state}`;

        return searchWords.every(word => combined.includes(word));
    });

    api.setState("rowData", {
        customCellEmittedActions: origData.customCellEmittedActions,
        rows: filteredRows
    });
}
