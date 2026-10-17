answer = execute();

function execute() {
    if (current.isNewRecord())
        return true;
    return new global.InteractionHelpRequestUtil().canAccessInteractionHelpRequest(current, "read");
}
