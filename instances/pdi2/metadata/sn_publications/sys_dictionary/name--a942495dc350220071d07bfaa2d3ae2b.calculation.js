(function calculatedFieldValue(current) {
	if(current.user && current.user.getDisplayValue())
		return current.user.getDisplayValue();
	else if(current.consumer && current.consumer.getDisplayValue())
		return current.consumer.getDisplayValue();
	
})(current);
