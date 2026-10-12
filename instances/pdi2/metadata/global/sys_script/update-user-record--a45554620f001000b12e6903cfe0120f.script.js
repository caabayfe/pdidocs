updateUserRecord();

function updateUserRecord() {
	var user = current.user.getRefRecord();
	if (!user.isValid())
		return;

	if (current.email_address.changes() && current.primary_email == true) {
		user.setWorkflow(false);
		user.email = current.email_address;
		user.update();
	}
}
