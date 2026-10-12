(function() {
    if (!name) {
        throw new Error("invalid argument. name is empty");
    }
	return gs.getProperty(name);
})();
