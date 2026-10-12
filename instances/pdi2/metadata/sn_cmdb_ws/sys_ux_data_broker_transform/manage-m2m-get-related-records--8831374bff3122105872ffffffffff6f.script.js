function transform(input) {
	const m2mMgr = new ManyToManyManager();
	return m2mMgr.getRelatedRecords({...input.payload, relatedTable: input.payload.table});
}
