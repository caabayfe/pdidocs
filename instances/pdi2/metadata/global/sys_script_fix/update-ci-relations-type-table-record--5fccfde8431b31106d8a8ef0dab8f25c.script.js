updateCIRelTypeTable();

function updateCIRelTypeTable() {
    if (pm.isZboot()) {
        gs.log('Zbooting: no need to do anything');
        return;
    }

    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "cmdb_rel_type");
    gr.addQuery("element", "name");

    gr.query();

    if (gr.next()) {
        if (gr.getValue("virtual")) {
            gr.setValue("virtual", false);
            gr.update();
        }
    }
}
