var success = sn_vcs.SourceControl.deleteLocalRepositoryOnCurrentNode(current.sys_id);
if (success)
	showSuccess();
else
	showError();

function showSuccess() {
	var msg = gs.getMessage('Job to clear the local repository folder was successful!');
	gs.addInfoMessage(msg);
}

function showError() {
	var msg = gs.getMessage('Unable to clear the local repository folder at this time');
	gs.addErrorMessage(msg);
}
