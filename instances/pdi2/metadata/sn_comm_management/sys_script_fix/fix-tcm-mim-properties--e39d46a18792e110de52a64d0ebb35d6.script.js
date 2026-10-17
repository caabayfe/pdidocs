(function() {
    if (GlidePluginManager.isZboot())
        return;

    gs.setProperty('com.snc.iam.email_client_recipient_items_enabled', gs.getProperty('sn_comm_management.email_client_recipient_items_enabled'));

    gs.setProperty('com.snc.iam.default_email_recipient_field', gs.getProperty('sn_comm_management.default_email_recipient_field'));
})();
