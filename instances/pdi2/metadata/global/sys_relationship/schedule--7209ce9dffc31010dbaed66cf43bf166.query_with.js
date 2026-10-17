(function refineQuery(current, parent) {
    var source = new GlideRecord("scan_source");
    source.addQuery("table", "scan_check_suite");
    source.addQuery("record_id", parent.getUniqueValue());
    source.query();

    var ids = [];
    if (source.next()) {
        var combo = new GlideRecord("scan_combo");
        combo.addQuery("sources", "CONTAINS", source.getUniqueValue());
        combo.query()

        while (combo.next())
            ids.push(combo.getUniqueValue());
    }

    current.addQuery("combo", "IN", ids);
})(current, parent);
