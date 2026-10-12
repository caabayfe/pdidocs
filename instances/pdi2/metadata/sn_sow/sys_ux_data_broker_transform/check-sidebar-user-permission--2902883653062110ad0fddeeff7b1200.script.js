function transform(input) {
    var output = {
        hasReadAcccess: false,
        isSidebarSupportedOnSOW: false,
        hasRecordWriteAccess: false
    };
    if (!input.userId || !input.recordSysId || !input.table)
        return output;
    var sidebarChatUtilsGr = new sn_sow_collab.SOWSidebarChatUtils();
    var recordGr = new GlideRecord(input.table);
    if (recordGr.get(input.recordSysId)) {
        output.hasRecordWriteAccess = recordGr.canWrite();
        output.hasReadAcccess = sidebarChatUtilsGr.hasPermission(input.userId, input.recordSysId, input.table);
        output.isSidebarSupportedOnSOW = sidebarChatUtilsGr.isSidebarSupportedOnSOW(input.table, input.recordSysId);
    }
    return output;
}
