function addInactiveDomains() {
    var dialog = new GlideModal('edit_inactive_domains_slushbucket');
    dialog.setWidth(450);
    dialog.setTitle(new GwtMessage().getMessage('Select Inactive Domains to Prepare for Cleanup'));
    dialog.setPreference("leftTable", "domain");
    dialog.setPreference("rightTable", "domain_cleanup_queue");
    dialog.setPreference("referenceField", "domain");
    dialog.setPreference("leftKey", "sys_id");
    dialog.setPreference("textField", "name");
    dialog.render();
}
