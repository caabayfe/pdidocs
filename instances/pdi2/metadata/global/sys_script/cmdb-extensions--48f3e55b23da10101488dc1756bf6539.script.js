function getCMDBExtensions() {
	var tables = new UnauthorizedChangeRequest().getSvcExcludedExtensions();

	for (var i=0; i < tables.size(); i++) {
		var val = tables.get(i);
		var lbl = GlideTableDescriptor.get(val).getLabel();
		answer.add(val, lbl);
	}
}
