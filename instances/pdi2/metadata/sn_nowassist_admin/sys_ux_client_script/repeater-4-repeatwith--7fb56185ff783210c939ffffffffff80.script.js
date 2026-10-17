/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    if (!api.state.paginationControls || !api.state.filteredSkillsVersions) {
        return [];
    }

    const {
        pageSize = 10,
        currentPage = 0
    } = api.state.paginationControls;
    
    const data = api.state.filteredSkillsVersions;
    const startIndex = pageSize * currentPage;
    const endIndex = Math.min(data.length, startIndex + pageSize);

    return data.slice(startIndex, endIndex);
}
