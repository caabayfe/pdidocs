/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const unconfirmedUserGroups = helpers.translateSync('Unconfirmed user groups');
    const incompatibleUsers = helpers.translateSync('Incompatible users');
    const unmappedGlobalCustomTables = helpers.translateSync('Unmapped global custom tables');
    const unmappedCustomApplications = helpers.translateSync('Unmapped custom applications');
    const tabs = api.context.props.shouldShowUnconfirmedUsers ? [{
        "id": "t0",
        "label": unconfirmedUserGroups
    }] : [];
    tabs.push({
        "id": "t1",
        "label": unmappedGlobalCustomTables
    }, {
        "id": "t2",
        "label": unmappedCustomApplications
    });
    return tabs;
}
