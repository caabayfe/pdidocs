async function script({ api, event, helpers, imports }) {
    const { parseErrorFromEvent, dispatchAndLogError } = imports["sn_cmdb_ws.CMDBWsDMErrorUtil"]();
    const errorStr = await parseErrorFromEvent({ event, helpers });
    dispatchAndLogError(errorStr, { api, helpers });
}
