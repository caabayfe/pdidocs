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
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    let cb = api.state.stagedContentBlocks;
    if (!cb) {
        return;
    }

    let blockcontext = await aceUtils.getContext();
    if (!blockcontext.isExecute) {
        blockcontext.isExecute = true;
        helpers.timing.setTimeout(checkAndRefresh, 20000);
    }

    api.state.stagedContentBlocks.forEach((block) => {
        let block_data = block;
        if (block.elementId == "styleable_container_9") {
            blockcontext = block.props_details.cloneStatusData || {};
        }
    });

    if (blockcontext.isdisablecomponent) {
        blockcontext.disable_definitions = false;
    }

    blockcontext.cancel_rollback_show_text = false;
    blockcontext.disable_cancel_button = true;
    blockcontext.showInputHelper = false;

    //await aceUtils.setContext(blockcontext);
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });

    function checkAndRefresh() {
        var isCloneActive = blockcontext.request_status === 'Clone Status : Running' || 
                            blockcontext.request_status === 'Clone Status : Rolling back';
        
        var isCleanupInProgress = blockcontext.request_status === 'Completed' && 
                                  (blockcontext.cleanupReadyToSchedule > 0 || blockcontext.cleanupScheduled > 0 || blockcontext.cleanupRunning > 0);

        if (isCloneActive || isCleanupInProgress) {
            refreshData();
            helpers.timing.setTimeout(checkAndRefresh, blockcontext.refreshInterval);
        }
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Trigger Sync Status from Clone Status Page",
            value: {}
        });
    } 

    function refreshData() {
        var operation = "SYNC_CLONE_STATUS_DATA";
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    sys_id: blockcontext.current_sys_id,
                },
            })
            .then((response) => {
                var data = JSON.stringify(response);
                var result = response.response.result;
                blockcontext = result;
                aceUtils.setContext(blockcontext);

            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }

}
