answer = true;

//Verify parent record permissions.
if(!current.isNewRecord())
	answer = current.activity_context.getRefRecord().canRead() && current.activity_type.getRefRecord().canRead();
