function calculatePolicyExecutionTime() {
	var diffMS = new GlideDateTime(current.end_time).getNumericValue() - new GlideDateTime(current.start_time).getNumericValue();
	return diffMS / (60 * 1000);
}

calculatePolicyExecutionTime();
