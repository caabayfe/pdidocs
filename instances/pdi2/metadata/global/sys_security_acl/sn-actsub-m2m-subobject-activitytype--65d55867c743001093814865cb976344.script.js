answer = true;

//Verify the module level permissions.
if(!current.isNewRecord())
	answer = current.subobject.getRefRecord().canRead() && current.activity_type.getRefRecord().canRead();
