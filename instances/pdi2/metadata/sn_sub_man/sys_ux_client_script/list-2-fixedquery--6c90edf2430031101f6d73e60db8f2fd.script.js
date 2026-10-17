/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const issuesTabID = api.state.issuesTabID;
    switch (issuesTabID) {
        case 't0':
            return 'gad_group.name!=null';
        case 't1':
            return '';
        case 't2':
            return '';
        case 't3':
            return '';
        default:
            return '';
    }
    
}
