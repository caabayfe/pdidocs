answer = true;

//Verify the module level permissions.
if(!current.isNewRecord() && current.module)
	answer =  current.module.getRefRecord().canRead();
