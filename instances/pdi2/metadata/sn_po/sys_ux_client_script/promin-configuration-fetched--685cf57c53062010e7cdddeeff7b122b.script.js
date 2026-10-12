/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const prominConfig = api.data.fetch_promin_configuration_1.output.data.GlidePromin_Query.configuration;
    api.setState('promin_config', prominConfig);

    const cimConfig = prominConfig.cimIntegration;
    const compareModeOn = api.state.compare_mode_on;
    const headerActions = api.state.header_actions || [];

    if (cimConfig.isPluginActive && cimConfig.permissions.canCreateInitiative && !compareModeOn) {
        if (!headerActions.some(ac => ac.id === 'create-cim'))
            headerActions.push({
                id: 'create-cim',
                label: await helpers.translate('Create CIM'),
            });
    }
    api.setState('header_actions', headerActions);

    if (prominConfig.automationDiscovery.isEnabled)
        api.setState('dynamic_tabs', [{
            route: 'dynamic-automation-opportunities',
            fields: {
                label: 'not-used',
                table: 'not-used',
            },
            label: await helpers.translate('Automation Opportunities'),
        }]);
}
