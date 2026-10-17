/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const owners = [...new Set(api.state.selectedRecordsOwners)].filter(elem => elem);

    if (owners.length > 1) {
        return 'Multiple record owners';
    }
    return owners[0];
}
