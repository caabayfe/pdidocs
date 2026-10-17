(function calculatedFieldValue(current) {
	 if(current.state == 'AVAILABLE') return new ProminUtils().getUIActionId(current.getUniqueValue()); 
})(current);
