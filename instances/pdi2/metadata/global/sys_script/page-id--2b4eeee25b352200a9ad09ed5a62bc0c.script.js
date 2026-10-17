function onBefore(current, previous) {
	var id = current.id.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (id.indexOf("__") != -1) 
		id = id.replace(/__/g, "_");

	// Replace any trailing underscores
	while (id != '' && id.charAt(id.length - 1) == '_') 
		id = id.substring(0, id.length - 1);

	if (current.id != id)
		current.id = id;
}
