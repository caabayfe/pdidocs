function transform(input) {
    const {
        payload,
        query
    } = input;
    const m2mMgr = new ManyToManyManager();
    return m2mMgr.getAvailableRecords({
        ...payload,
        relatedTable: payload.table,
        encodedQuery: query
    });
}
