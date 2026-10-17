function transform(input) {
    if (gs.nil(input) || gs.nil(input.commTaskTable) || gs.nil(input.commTaskSysId))
        return [];

    var commTaskGr = new GlideRecord(input.commTaskTable);
    if (!commTaskGr.get(input.commTaskSysId)) return [];
    var sourceTable = "";
    if (commTaskGr.comm_plan && commTaskGr.comm_plan.source && commTaskGr.comm_plan.source.getRefRecord().getRecordClassName())
        sourceTable = commTaskGr.comm_plan.source.getRefRecord().getRecordClassName();
    if (!sourceTable)
        sourceTable = new sn_comm_management.CommunicationManagementBridgeSNC().getTaskTableGivenCommTaskTable(input.commTaskTable);
    return new CommunicationManagementUXFBaseUtil().getRemainingChannels(commTaskGr, sourceTable);
}
