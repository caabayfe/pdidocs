function transform(input) {
    if (input.parentTable) {
		return new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(input.parentTable + '').getCommTaskInstanceForTask();
    }
}
