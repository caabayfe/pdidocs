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
    const { version, projectConfiguration } = event.payload.data.output.data.GlidePromin_Query;

    const id = version ? version.id : '';
    const trackerId = version ? version.trackerId : '';

    const {
        state: {
            value: miningState
        },
        owner: {
            sysId,
            displayName
        },
        watchList,
        permissions: {
            canWrite,
            canMine,
            canDelete,
        },
    } = projectConfiguration;

    let projectData = {
        ...api.state.projectData,
        ismining: false,
        versionId: "",
        watchList,
        canMine,
    };

    if (id) {
        const ismining = trackerId && (miningState === api.state.MINING_STATE.SCHEDULED.value || miningState === api.state.MINING_STATE.MINING_DATA.value);
        const isMaint = api.context.session.user.roles?.includes('maint');
        const isFreemium = projectData?.source?.startsWith('FREEMIUM');

        projectData = {
            ...projectData,
            ismining,
            versionId: id,
            iframeURL: ismining ? `/batchInstallPopup.do?execution_tracker_id=${trackerId}&sysparm_use_polaris=true` : '',
            readonly: !isMaint && isFreemium || ismining,
        };

        if (ismining) {
            api.data.record_watcher_1.subscribe({
                table: 'sys_execution_tracker',
                filterConditions: `sys_id=${trackerId}`,
                subscribe: true,
            });

            helpers.modal.open("[component-id$='mining_summary']");
        }
    }

    api.setState("projectData", projectData);

    api.data.get_project_details_1.refresh();
}
