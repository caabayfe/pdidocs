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
    helpers.modal.close("[component-id$='select_mining_type_modal']");
    api.setState('preparingToMine', false);

    if (event.payload?.errors?.length) {
        // User should not be stopped from mining even if we failed to fetch license info.
        startMining();
    } else {
        const result = api.data.fetch_parent_entity_row_count.output.data.GlideAggregate_Query;
        if (result.length && Number(result[0].count) > api.state.meteredUsageLimit.raw) {
            // Show meter based usage warning modal
            helpers.modal.open("[component-id$='metered_based_license_warning_modal']");
            return;
        } else {
            startMining();
        }
    }

    function startMining() {
        api.data.fetch_mine_project.execute({
            'sysId': api.context.props.projectId,
            'preview': !Boolean(api.state.fullMine)
        });
    }
}
