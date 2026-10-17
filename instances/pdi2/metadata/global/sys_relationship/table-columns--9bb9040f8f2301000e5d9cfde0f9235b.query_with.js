var tables = GlideDBObjectManager.getTables(parent.name);

if (parent.internal_type == "collection") {
	current.addQuery("name", tables);
	current.addQuery("internal_type", "!=", "collection");
} else {
	current.addQuery("name", "jared");
	current.addQuery("name", "brent");	
}
