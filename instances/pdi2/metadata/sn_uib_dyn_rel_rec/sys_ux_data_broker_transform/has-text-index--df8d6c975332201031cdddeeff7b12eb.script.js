function transform(input)  {
	var indexed = new GlideRecord("ts_index_name");
	indexed.addQuery("table", "IN", new GlideTableHierarchy(input.table).getTables());
	indexed.query();
	return ret = indexed.hasNext();
}
