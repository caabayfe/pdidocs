var success = sn_creatorstudio.ApprovalUtils.approve(current);

if (success)
    gs.addInfoMessage(gs.getMessage('<b>Approved</b> The request has been approved'));

current.update();
