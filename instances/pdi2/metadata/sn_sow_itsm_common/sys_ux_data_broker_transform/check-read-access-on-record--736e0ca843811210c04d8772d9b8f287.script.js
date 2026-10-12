function transform(input) {
    var table = input.table;
    var sysId = input.sysId;
    if (!table || table === "" || !sysId || sysId === "") {
        return false;
    }
    var gr = new GlideRecord(table);
    gr.get(sysId);

    return gr.isValidRecord() && gr.canRead();
}
