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
    const cardSelected = api.state.entitlementResolutionSelected;
    api.setState('projectData', {
        ...api.state.projectData,
        ismining: false,
        isRemining: true,
        showSummary: false,
    });
    if (cardSelected === 'sample-mine') {
        api.setState('miningType', 'SAMPLE');
        api.data.fetch_mine_project.execute({
            'sysId': api.context.props.projectId,
            'preview': true,
        });
    } else if (cardSelected === 'existing-project') {
        helpers.navigate.to("process-details-latest-version", {
            projectId: api.context.props.projectId,
        }, null, true);
    } else if (cardSelected === 'adjust-scope') {
        helpers.navigate.to("promin_project", {
            projectId: api.context.props.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
    api.setState('entitlementResolutionSelected', undefined);

}
