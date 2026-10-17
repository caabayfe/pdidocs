function transform(input) {
	let result = {
		"canRead": false,
		"canWrite": false,
		"className": input.table
	};
	
	let gr = new GlideRecordSecure(input.table);
	if (gr.get(input.sysId)) {
		result.canRead = gr.canRead();
		result.canWrite = gr.canWrite();
		// Return the actual record class for accurate data in child components
		result.className = gr.getRecordClassName();
	}	
	return result;
}
