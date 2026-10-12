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
    const prominConfig = event.payload.data.output.data.GlidePromin_Query.configuration;
    api.setState('promin_config', prominConfig);
    const compareModeOn = api.state.compare_mode_on;
    const headerActions = api.state.header_actions || [];

    const cimConfig = prominConfig.integrations.cim;
    if (cimConfig.isPluginActive && cimConfig.permissions.canCreate && !compareModeOn && !headerActions.some(ac => ac.id === 'create-cim'))
        headerActions.push({
            id: 'create-cim',
            label: await helpers.translate('Create CIM'),
        });

    const coeConfig = prominConfig.integrations.automationCenter;
    if (coeConfig.isPluginActive && coeConfig.permissions.canCreate && !headerActions.some(ac => ac.id === 'new-coe'))
        headerActions.push({
            id: 'new-coe',
            label: await helpers.translate('Create automation request'),
        });

    api.setState('header_actions', headerActions);
}
