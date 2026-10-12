(function refineQuery(current, parent) {
    var path = parent.base_uri;
	var name = parent.name;
	path = path.replace("/api/", "");
    current.addEncodedQuery("api_path=" + path + "^api=" + name);
})(current, parent);
