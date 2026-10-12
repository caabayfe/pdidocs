function script({ api, event, helpers, imports }) {
    const {
        handleReferenceLinkClickEvent
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
   handleReferenceLinkClickEvent({event, helpers});
}
