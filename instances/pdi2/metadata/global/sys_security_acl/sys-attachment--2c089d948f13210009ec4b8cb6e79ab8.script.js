answer = getSCAttachmentCreateAnswer();

function getSCAttachmentCreateAnswer() {
    if (current.table_name == 'sc_cart_item') {
        var tableSysId = current.table_sys_id;
        var cartItemRecord = new GlideRecord("sc_cart_item");
        cartItemRecord.get(tableSysId);
        if (!cartItemRecord.isValidRecord() || cartItemRecord.canWrite())
            return true;
    }
    return false;
}
