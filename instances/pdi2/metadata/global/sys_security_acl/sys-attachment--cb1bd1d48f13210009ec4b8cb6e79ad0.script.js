answer = getSCAttachmentReadAnswer();

function getSCAttachmentReadAnswer() {
    if (current.table_name == 'item_option_new')
        return true;

    if (current.table_name == 'sc_cart_item') {
        var tableSysId = current.table_sys_id;
        if (!GlideStringUtil.isEligibleSysID(tableSysId))
            return false;

        var cartItemRecord = new GlideRecord("sc_cart_item");
        cartItemRecord.get(tableSysId);

    // if the record isn't added in the database, only grant access to user who created the record.
        if (!cartItemRecord.isValidRecord())
            return (gs.getUserName() == current.getValue("sys_created_by"));

        if (cartItemRecord.canRead())
            return true;

    }
    return false;
}
