(function executeRule(current, previous /*null when async*/ ) {
    sendManagerChangeMessage();

    function sendManagerChangeMessage() {
        var managerChangeSender = new sn_mif_core.ManagerChangeSender();
        var operation = current.operation();
        var application = current.application;
        if (operation == "delete") {
            gs.debug("Removing manager relationship for instance {0} and application {1}",
                current.managing_instance.instance_name, application || 'global');
            managerChangeSender.removeManager(current.managing_instance.instance_name, application);
        } else if (operation == "insert" || operation == "update") {
            if ("awaiting-confirmation" == current.approval || "approved" == current.approval) {
                gs.debug("Adding manager relationship for instance {0} and application {1}",
                    current.managing_instance.instance_name, application || 'global');
                managerChangeSender.addManager(current.managing_instance.instance_name, application);
            } else if ("rejected" == current.approval) {
                gs.debug("Rejecting manager request for instance {0} and application {1}",
                    current.managing_instance.instance_name, application || 'global');
                managerChangeSender.rejectManagerRequest(current.managing_instance.instance_name, application);
            }
        }
    }
})(current, previous);
