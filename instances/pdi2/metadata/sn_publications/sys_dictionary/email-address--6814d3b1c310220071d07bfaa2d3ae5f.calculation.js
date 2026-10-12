(function calculatedFieldValue(current) {

	// Add your code here
	if(current.consumer){
		var csm = current.consumer.getRefRecord();
		return csm.getValue('email');
	}else{
		var usr = current.user.getRefRecord();
		return usr.getValue('email');
	}
})(current);
