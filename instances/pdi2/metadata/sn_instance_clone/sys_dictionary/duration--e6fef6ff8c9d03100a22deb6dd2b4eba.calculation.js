(function calculatedFieldValue(current) {

	if (gs.nil(current.started) || gs.nil(current.completed)) 
		return '';
 
	var dur = GlideDateTime.subtract(new GlideDateTime(current.started), new GlideDateTime(current.completed)); 
	return dur.getDurationValue();
})(current);
