var table = !gs.nil(current.notification) ? current.notification.collection : "";
if (table != "") {
    var gr = new GlideRecord("sys_db_object");
    gr.addQuery('name', table);
    gr.query();
    if (gr.next()) {
        table = gr.getUniqueValue();
    }
}
table;
