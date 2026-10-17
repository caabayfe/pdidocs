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
    if (!api.state.projectData.ismining) {
        if (api.state.fullMine) {
            api.setState('miningType', 'FULL');
            // Check license type, before submitting mining
            api.data.get_meter_based_license_flag.refresh();
        } else {
            api.setState('miningType', 'SAMPLE');
            helpers.modal.close("[component-id$='select_mining_type_modal']");
            api.data.fetch_mine_project.execute({
                'sysId': api.context.props.projectId,
                'preview': true,
            });
        }
    } else {
        helpers.modal.open("[component-id$='mining_summary']");
    }
}
