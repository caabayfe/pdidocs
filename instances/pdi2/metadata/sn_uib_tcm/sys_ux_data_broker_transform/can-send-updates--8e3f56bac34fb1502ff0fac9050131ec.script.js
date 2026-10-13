function transform(input) {
    if (!input || !input.commTaskTable || !gs.tableExists(input.commTaskTable) || !input.commTaskSysId) return false;
    var commTaskGR = new GlideRecord(input.commTaskTable);
    if (commTaskGR.get(input.commTaskSysId))
        return new sn_comm_management.CommunicationManagementUtil().canSendUpdates(commTaskGR);
}
