for (var key in current) {
	if(key.includes("color")) {
		current[key] = current[key].trim();
	}
}
