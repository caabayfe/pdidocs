function transform(input) {
    var filter = input.filters;
    var table = input.table;
    var newQuery = filter;
    if (filter) {
        try {
            var gr = new GlideRecordSecure(table);
            var filterArr = filter.split('=');
            var field = filterArr[0];
            var ed = gr.getElement(field).getED();
            if (ed.getInternalType() === 'reference') {
                newQuery = field + '.sys_id' + '=' + filterArr[1];
            }
        } catch (e) {
            gs.error('failed');
        }
    }
    return newQuery;
}
