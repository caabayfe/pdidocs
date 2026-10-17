(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("vtb_card");
    if (gr.get(current.table_key)) {
        var count = parseInt(gr.getValue("labels_count"));
        gr.setValue("labels_count", count + 1);
        gr.update();
    }

})(current, previous);
