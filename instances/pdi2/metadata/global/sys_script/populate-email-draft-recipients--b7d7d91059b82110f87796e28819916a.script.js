(function executeRule(current, previous /*null when async*/ ) {
    new IAMWorkspaceEmailComposerUtil(current).addDraftRecipients();
})(current, previous);
