(function() {
    if (pm.isZboot())
        return;

    var table = "sttrm_state";
    var column = "state_sequence";

    var dictGr = new GlideRecord("sys_dictionary");
    dictGr.addQuery("name", table);
    dictGr.addQuery("element", column);
    dictGr.query();
    if (dictGr.next()) {
        dictGr.setValue("read_only", false);
        dictGr.update();
    }
})();
