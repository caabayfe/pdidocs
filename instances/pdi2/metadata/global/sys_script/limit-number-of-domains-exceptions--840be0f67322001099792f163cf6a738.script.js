(function executeRule(current, previous /*null when async*/ ) {
    var maxDomains = GlideProperties.get('glide.email_address_filter.max_domains', 100);
    var domains = current.getValue('domains');
    if (GlideStringUtil.nil(domains))
        return;

    var domainsArray = domains.split(',');
    if (domainsArray.length > maxDomains) {
        gs.warn('Number of domains associated with email address filter of sys_id [' + current.getUniqueValue() + '] has exceeded maximum value');
        current.setAbortAction(true);
    }

    var maxExceptions = GlideProperties.get('glide.email_address_filter.max_exceptions', 1000);
    var exceptions = current.getValue('exceptions');
    if (GlideStringUtil.nil(exceptions))
        return;

    var exceptionsArray = exceptions.split(',');
    if (exceptionsArray.length > maxExceptions) {
        gs.warn('Number of exceptions associated with email address filter of sys_id [' + current.getUniqueValue() + '] has exceeded maximum value');
        current.setAbortAction(true);
    }
})(current, previous);
