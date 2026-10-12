if (current.state != 'NEW' && ((current.operation() == "update" && current.active.changes() && current.active == false) || (current.operation() == "delete")))
	deleteProfile();

function deleteProfile() {
	var result = new sn_ais.Synchronizer().deleteProfile(current.name);
	if (result)
		gs.addInfoMessage(gs.getMessage("Select the Active option and click Publish to reactivate this search profile"));
	else {
		gs.addErrorMessage(gs.getMessage("Failed to delete search profile, please check log for more details"));
		current.setAbortAction(true);
	}
}
