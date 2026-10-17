(function refineQuery(current, parent) {
    var isDefault = parent.getValue('default');
    if (isDefault == true) {
        var type = parent.getValue('type');
        if (type == 'outbound')
            current.addEncodedQuery('type=smtp^system_address_filterISEMPTY^ORsystem_address_filter.default=true');
        else
            current.addEncodedQuery('type=pop3^ORtype=imap^system_address_filterISEMPTY^ORsystem_address_filter.default=true');
    } else
        current.addQuery('system_address_filter', parent.getUniqueValue());
})(current, parent);
