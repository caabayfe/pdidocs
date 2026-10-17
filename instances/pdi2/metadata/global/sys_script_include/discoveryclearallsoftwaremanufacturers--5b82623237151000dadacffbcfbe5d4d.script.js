function DiscoveryClearAllSoftwareManufacturers() {
    var gr = new GlideRecord("cmdb_ci_spkg");
    gr.addNotNullQuery("manufacturer");
    gr.query();
    while (gr.next()) {
        gr.setValue("manufacturer", "");
        gr.update();
    }
}
