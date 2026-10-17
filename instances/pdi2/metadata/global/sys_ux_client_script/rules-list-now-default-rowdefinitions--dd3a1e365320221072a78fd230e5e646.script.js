/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var response = api.state.ruleListRows;
    if (!(response && response.rows))
        return { rows: [] };
    var rowList = response.rows;
    var searchText = api.state.rulesSearchText || '';

    // If searchtext is not empty, apply search
    if (searchText.length) {
        rowList = rowList.filter(row => row.cells.rule.value.toLowerCase().includes(searchText.toLowerCase()));
    }

    var currentPage = api.state.currentRulePage;
    var rowsPerPage = 10;

    var startIndex = currentPage * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, rowList.length);

    return {
        rows: rowList.filter((obj, index) => {
            return index >= startIndex && index < endIndex;
        })
    };
}
