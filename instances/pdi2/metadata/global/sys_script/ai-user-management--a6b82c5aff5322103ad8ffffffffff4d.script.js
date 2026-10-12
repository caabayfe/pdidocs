(function executeRule(current, previous /*null when async*/ ) {
    if (gs.hasRole('ai_user_admin') && !gs.hasRole('user_admin')) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('The ai_user_admin role is limited to managing users of the AI identity type. It can only create, update, or delete AI users.'));
    }
})(current, previous);
