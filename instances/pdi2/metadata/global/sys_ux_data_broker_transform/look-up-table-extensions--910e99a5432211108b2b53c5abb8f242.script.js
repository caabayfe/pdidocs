function transform(input) {
    return {
        tableExtensions: j2js(GlideDBObjectManager.get().getTableExtensions(input.table))
	};
}
