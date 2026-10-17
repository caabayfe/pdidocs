/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var appsInstalledMessages = {};
    var categorizedAppsList = api.context.props.categorizedAppsList;
    for (var i = 0; i < categorizedAppsList.length; i++) {
        var messagesForMaturityGroup = {};
        var weightedApplications = categorizedAppsList[i].weightedApplications;
        for (var j = 0; j < weightedApplications.length; j++)
            messagesForMaturityGroup[weightedApplications[j].applications[0].weight] = await helpers.translate('{0} of {1} installed', weightedApplications[j].installedCount, weightedApplications[j].applications.length);

        appsInstalledMessages[weightedApplications[0].applications[0].maturityValue] = messagesForMaturityGroup;
    }
    api.setState('appsInstalledMessages', appsInstalledMessages);

    const expandMessage = await helpers.translate('Expand');
    const collapseMessage = await helpers.translate('Collapse');
    const seeOptionalAppsMessage = await helpers.translate('See optional apps');
    const hideOptionalAppsMessage = await helpers.translate('Hide optional apps');
    api.setState('expandMessage', expandMessage);
    api.setState('collapseMessage', collapseMessage);
    api.setState('seeOptionalAppsMessage', seeOptionalAppsMessage);
    api.setState('hideOptionalAppsMessage', hideOptionalAppsMessage);
}
