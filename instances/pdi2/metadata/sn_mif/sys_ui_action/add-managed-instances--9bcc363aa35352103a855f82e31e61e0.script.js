function produceDialog() {
    var dialog = new GlideModal("sn_mif_global_managing_instance_request");
    var msg = getMessage('Add Managed Instances');
    dialog.setTitle(msg);
    dialog.setWidth("800");
    dialog.render();
}
