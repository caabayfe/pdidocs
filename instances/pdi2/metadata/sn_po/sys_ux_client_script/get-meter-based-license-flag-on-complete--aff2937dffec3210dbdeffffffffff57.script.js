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
    if (event.payload?.errors?.length) {
        // User should not be stopped from mining even if we failed to fetch license info.
        mineProject();
        return;
    }
 
    const {
        hasCapacityBasedLicense,
        usageLimit
    } = api.data.get_meter_based_license_flag.output.data.snPo.GlidePromin.prominGetCapacityBasedLicenseInfo;
    api.setState('hasCapacityBasedLicense', hasCapacityBasedLicense);

    const {
        formatNumber
    } = imports["global.prominUtils"]();
 
    api.setState('meteredUsageLimit', {
        raw: usageLimit,
        formatted: formatNumber(usageLimit, { full: true })
    });
    const parentEntity = api.state.entityCardRepeaterData.find(entity => entity.parentId == null);
    // When usage limit is 0 or less, no need to show warning.
    if (hasCapacityBasedLicense && usageLimit > 0 && parentEntity) {
        api.setState('parentEntityRecordCountQueryRequest', {
            table: parentEntity.table?.name,
            filter: parentEntity.filter?.value || ''
        });
        api.data.fetch_parent_entity_row_count.refresh();
    } else {
        mineProject();
    }

    function mineProject() {
        helpers.timing.setTimeout(() => {
            helpers.modal.close("[component-id$='select_mining_type_modal']");
            api.setState('preparingToMine', false);
            api.data.fetch_mine_project.execute({
                'sysId': api.context.props.projectId,
                'preview': false,
            });
        }, 1000); // Fake delay to show loader
    }
}
