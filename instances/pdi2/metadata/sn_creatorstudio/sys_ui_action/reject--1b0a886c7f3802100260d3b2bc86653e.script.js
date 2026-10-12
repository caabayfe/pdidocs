var success = sn_creatorstudio.ApprovalUtils.reject(current);

if (success)
	gs.addInfoMessage(gs.getMessage('<b>Rejected</b> The request has been rejected'));

current.update();
