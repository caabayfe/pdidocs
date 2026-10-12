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
            return helpers.translateSync('Unconfirmed user groups');
        case 't2':
            return helpers.translateSync('Unmapped custom applications');
        case 't3':
            return helpers.translateSync('Incompatible users');
        default:
            return helpers.translateSync('Unmapped global custom tables');;
    }
}
