function transform(input) {
    if (!input || !input.taskTable || !input.taskSysId)
        return {};
    return new CommunicationManagementUXFControllerUtil().getCommunicationDetails(input.taskTable, input.taskSysId);
}
