/*
 *  If a fileSysId is passed in, this API will get the commit history for a specific file.
 *  Otherwise, the commit history for the current branch will be shown.
 */
(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var fileSysId = request.queryParams.fileSysId,
        currentRepo = sn_vcs.AppSourceControl.getRepository(appId),
        branch = currentRepo.getBranch(currentRepo.getCurrentBranch()),
        commits = getCommitList();

    response.setContentType('application/json');
    response.setBody({
        commitCount: commits.length,
        commits: commits
    });
    response.setStatus(200);

    function getCommitList() {
        var commits = [],
            commitRecords = (fileSysId) ?
            branch.getCommitsForFile(fileSysId) :
            branch.getCommits();

        while (commitRecords.next())
            commits.push(getCommitDetails(commitRecords));

        return commits;
    }

    function getCommitDetails(commitRecord) {
        return {
            sysId: commitRecord.getCommitId(),
            comment: commitRecord.getComments(),
            committer: {
                name: commitRecord.getCommitterName(),
                email: commitRecord.getCommitterEmail()
            },
            dateCommitted: commitRecord.getDateCommitted().getDisplayValue(),
            files: getCommittedFiles(commitRecord)
        };
    }

    function getCommittedFiles(commitRecord) {
        var details = commitRecord.getCommitDetails(),
            committedFiles = [];

        while (details.next()) {
            var fileName = details.getFileName();

            if (isValidFileName(fileName))
                committedFiles.push(fileName);
        }

        return committedFiles;
    }

    function isValidFileName(fileName) {
        return fileName !== 'checksum.txt' && fileName !== '/dev/null';
    }

})(request, response);
