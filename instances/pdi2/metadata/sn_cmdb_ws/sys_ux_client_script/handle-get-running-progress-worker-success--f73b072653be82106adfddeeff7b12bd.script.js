function script({
    api,
    event
}) {
    if (api.data.getRunningProgress.output?.data?.GlideRecord_Query?.sn_cmdb_ws_progress_monitor?._results?.length) {
        const {
            percent_complete,
            sys_id
        } = api.data.getRunningProgress.output.data.GlideRecord_Query.sn_cmdb_ws_progress_monitor._results[0];
        if (percent_complete && sys_id) {
            api.setState('progressId', sys_id.value);
            api.setState('progressValue', percent_complete.value);
        }
    }
}
