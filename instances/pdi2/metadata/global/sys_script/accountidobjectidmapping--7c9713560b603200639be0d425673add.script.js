(function executeRule(current, previous /*null when async*/) {

	if(current.operation() == 'insert')
	{
		   var insertAccountID=current.account_id;
			current.setValue('object_id',insertAccountID);
	}
	if(current.operation() == 'update')
	{
	 var updateAccountID=current.account_id;
	 current.setValue('object_id',updateAccountID);
	}

})(current, previous);
