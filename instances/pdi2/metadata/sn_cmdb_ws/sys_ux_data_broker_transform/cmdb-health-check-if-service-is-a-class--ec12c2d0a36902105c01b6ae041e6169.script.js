function transform(input) {
	var gr = new GlideRecord(input.id);
	return gr.isValid();
}
