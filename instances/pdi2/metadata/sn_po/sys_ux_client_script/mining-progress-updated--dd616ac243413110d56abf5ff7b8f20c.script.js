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

    function getMiningStateByProgressState(progressState) {
        /*
         * progressState corresponds to `state` field in `sys_execution_tracker`
         * 0 - Pending
         * 1 - Running
         * 2 - Successful
         * 3 - Failed
         * 4 - Cancelled
         */
        let miningState;
        switch (Number(progressState)) {
            case 0:
                miningState = api.state.MINING_STATE.SCHEDULED;
                break;
            case 1:
                miningState = api.state.MINING_STATE.MINING_DATA;
                break;
            case 2:
                miningState = api.state.MINING_STATE.AVAILABLE;
                break;
            case 3:
                miningState = api.state.MINING_STATE.ERROR;
                break;
            case 4:
                miningState = api.state.MINING_STATE.CANCELLED;
                break;
            default:
                miningState = api.state.MINING_STATE.SCHEDULED;
        }

        return miningState;
    }
    const {
        data: {
            changes,
            record,
            sys_id: trackerId,
        },
    } = event.payload;
    if (!changes.includes('percent_complete') && !changes.includes('state'))
        return;
    const progress = record.percent_complete ? record.percent_complete.value : api.state.projectData.progress;
    const miningState = record.state ? getMiningStateByProgressState(record.state.value) : api.state.projectData.miningState;
    const ismining = trackerId && (miningState.value === api.state.MINING_STATE.SCHEDULED.value || miningState.value === api.state.MINING_STATE.MINING_DATA.value);
    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = api.state.projectData?.source?.startsWith('FREEMIUM');

    const updatedProjectList = {
        ...api.state.projectData,
        progress,
        miningState: miningState,
        ismining,
        readonly: (!isMaint && isFreemium) || ismining,
    };
    api.setState("projectData", () => updatedProjectList);
    // In case of capacity based license, once the mining state moves from 'SCHEDULED' -> 'MINING_DATA', show mining progress modal
    if (api.state.hasCapacityBasedLicense && api.state.miningType === 'FULL' && miningState.value === api.state.MINING_STATE.MINING_DATA.value) {
        api.setState('entitlementCheckInProgress', false);
        helpers.modal.close("[component-id$='entitlement_check_modal']");
        helpers.modal.open("[component-id$='mining_summary']");
    }

    if (miningState.value === api.state.MINING_STATE.AVAILABLE.value || miningState.value === api.state.MINING_STATE.CANCELLED.value || miningState.value === api.state.MINING_STATE.ERROR.value) {
        api.setState("miningState", miningState);
        api.data.record_watcher_1.subscribe({
            table: 'sys_execution_tracker',
            filterConditions: `sys_id=${trackerId}`,
            subscribe: false
        });
        api.data.mining_summary_fetch_2.execute({
            'versionId': api.state.projectData.versionId
        });
    }
}
