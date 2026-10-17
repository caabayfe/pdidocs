(function calculatedFieldValue(current) {

	if (gs.nil(current.started) || gs.nil(current.ended)) 
		return '';
 
	var dur = GlideDateTime.subtract(new GlideDateTime(current.started), new GlideDateTime(current.ended)); 
	return dur.getDurationValue();
})(current);
