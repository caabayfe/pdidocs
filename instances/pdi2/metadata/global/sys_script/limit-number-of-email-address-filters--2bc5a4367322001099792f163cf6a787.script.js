(function executeRule(current, previous /*null when async*/ ) {
    var maxEmailAddressFilters = GlideProperties.get('glide.email_system_address_filter.max_address_filters', 100);
    var addressFilters = current.getValue('email_address_filters');
    if (GlideStringUtil.nil(addressFilters))
        return;

    var filterArray = addressFilters.split(',');
    if (filterArray.length > maxEmailAddressFilters) {
        gs.warn('Number of email address filters associated with email system filter of sys_id [' + current.getUniqueValue() + '] has exceeded maximum value');
        current.setAbortAction(true);
    }
})(current, previous);
