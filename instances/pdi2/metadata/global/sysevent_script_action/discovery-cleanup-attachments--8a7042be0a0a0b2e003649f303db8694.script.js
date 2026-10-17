// delete attachments, if we should...
if (current) {
    var da = new DiscoveryAttachments(current.sys_id);
    da.deleteAttachments();
}
