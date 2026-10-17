(function executeRule(current, previous /*null when async*/ ) {
    if (gs.hasRole('ai_user_admin') && !gs.hasRole('user_admin')) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('The ai_user_admin role can assign or remove roles only for users with the AI identity type'));
    }
})(current, previous);
