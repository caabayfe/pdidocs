function transform(input) {
    const {
        payload,
        targetRecords
    } = input;
    const m2mMgr = new ManyToManyManager();
    return m2mMgr.updateRelatedRecords({
        ...payload,
        relatedTable: payload.table
    }, targetRecords);
}
