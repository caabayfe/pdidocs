(function executeRule(current, previous /*null when async*/ ) {
    var active = current.getValue('active');

    // Need not proceed if the current record is being set as inactive
    if (active == 0)
        return;

    var repoUrl = current.getValue('remote_resource');
    if (!repoUrl)
        return;

    var credentialsUtil = new GliderGitCredentialsUtil();
    var currentUserId = current.getValue('user');
    var currRepoScore = credentialsUtil.getMaxScore(repoUrl);
    var repoMatch = credentialsUtil.getIdeGitCredential(repoUrl, currentUserId);
    var currentRecordSysId = current.getValue('sys_id');

    // Need not proceed if there are no active records currently or current is active
    if (repoMatch && repoMatch.sys_id !== currentRecordSysId) {
        gs.addErrorMessage(sn_i18n.Message.getMessage('glider_ide:git', '[IDE] The resource {repoUrl} already has an active credential. You can view it <a href="/sn_glider_ide_git_credential?sys_id={sys_id}">here</a>. Only one active credential is allowed per resource per user.', {
            repoUrl,
            sys_id: repoMatch.sys_id
        }));
        current.setAbortAction(true);
    }

})(current, previous);
