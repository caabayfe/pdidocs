(function executeRule(current, previous /*null when async*/) {
    var certId = current.getUniqueValue();
    var active = current.getValue("active");
    var gAttachment = new GlideAggregate("sys_attachment");
    gAttachment.addNotNullQuery("size_bytes");
    gAttachment.addQuery("table_sys_id", certId);
    gAttachment.addQuery("table_name", "sys_certificate");
    gAttachment.query();

    if (gAttachment.getCount() < 1) {
        if (active == true) {
            gs.addErrorMessage(gs.getMessage("No associated attachment found for certificate. Consider deactivating this certificate until an attachment is added."));
        } else {
            gs.addInfoMessage(gs.getMessage("No associated attachment found for certificate. Add an attachment before activating this certificate."));
        }
    }

})(current, previous);
