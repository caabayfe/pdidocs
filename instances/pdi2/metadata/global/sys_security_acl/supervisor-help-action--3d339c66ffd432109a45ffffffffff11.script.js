answer = execute();

function execute() {
    if (current.isNewRecord())
        return true;
    return new global.InteractionHelpRequestUtil().canAccessSupervisorHelpAction(current, "read");
}
