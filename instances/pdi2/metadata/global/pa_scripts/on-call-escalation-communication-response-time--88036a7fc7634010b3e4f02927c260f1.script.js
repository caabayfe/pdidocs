function calculateResponseDuration() {
	var diffMS = new GlideDateTime(current.responded_at).getNumericValue() - new GlideDateTime(current.attempted_at).getNumericValue();
	return diffMS / (60 * 1000);
}

calculateResponseDuration();
