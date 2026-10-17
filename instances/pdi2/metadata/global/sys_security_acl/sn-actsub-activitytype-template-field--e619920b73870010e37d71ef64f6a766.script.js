answer = true;

//Verify the module level permissions.
if(!current.isNewRecord() && current.template && current.template.module)
	answer = current.template.module.getRefRecord().canRead();
