//if there are any pending code reviews for this instance, dont let delete go through.
if (SNC.HubAPI.isPushUnfinished(current.getValue('instance_id'))) {
	current.setAbortAction(true);

	//send a ui notification to tell the user that this instance cannot be deleted yet.
	var n = new UINotification();
	n.setText(gs.getMessage('This remote instance cannot be deleted because there is a pending code review'));
	n.send();
}
