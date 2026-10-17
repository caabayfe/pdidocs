/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

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
    const updatedProjectList = {
        ...api.state.projectData,
        progress,
        ismining: trackerId && (miningState.value === api.state.MINING_STATE.SCHEDULED.value || miningState.value === api.state.MINING_STATE.MINING_DATA.value)
    };
    api.setState("projectData", updatedProjectList);
    if (progress == 100 && miningState.value === api.state.MINING_STATE.AVAILABLE.value || miningState.value === api.state.MINING_STATE.CANCELLED.value || miningState.value === api.state.MINING_STATE.ERROR.value) {
        api.data.mining_summary_fetch_1.execute({'versionId': api.state.projectData.versionId});
    }
}
