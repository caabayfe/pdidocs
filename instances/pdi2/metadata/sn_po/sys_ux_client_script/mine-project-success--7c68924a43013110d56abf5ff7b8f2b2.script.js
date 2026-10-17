/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {errors = []} = event.payload;

    if (errors.length) {
        if (api.state.hasCapacityBasedLicense && api.state.miningType === 'FULL') {
            api.setState('entitlementCheckInProgress', false);
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'mine-project-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: errors[0].message,
                action: {
                    type: 'dismiss'
                },
            }]
        });
        return;
    }

    const mineModelData = event.payload?.data?.output?.data?.GlidePromin_Mutation?.mineModel;
    if (!mineModelData) return;

    const {
        versionId,
        projectDefinition: {projectId},
        state: miningState,
        trackerId,
        progress,
    } = mineModelData;

    const updatedProject = {
        ...api.state.projectData,
        id: projectId,
        versionId,
        miningState,
        progress,
        iframeURL: `/batchInstallPopup.do?execution_tracker_id=${trackerId}&sysparm_use_polaris=true`,
    };

    api.data.record_watcher_1.subscribe({
        table: 'sys_execution_tracker',
        filterConditions: `sys_id=${trackerId}`,
        subscribe: true
    });

    if (api.state.hasCapacityBasedLicense && api.state.miningType === 'FULL') {
        api.setState('entitlementCheckInProgress', true);
    }
    helpers.modal.open((api.state.hasCapacityBasedLicense && api.state.miningType === 'FULL') ? "[component-id$='entitlement_check_modal']" : "[component-id$='mining_summary']");
    api.setState('trackerId', trackerId);
    api.setState('projectData', updatedProject);
}
