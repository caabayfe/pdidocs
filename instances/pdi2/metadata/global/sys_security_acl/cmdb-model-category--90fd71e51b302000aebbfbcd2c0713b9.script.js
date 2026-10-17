if (!current.isNewRecord() &&
    GlideDomainSupport.isDataSeparationEnabled() &&
    current.getValue('sys_domain') === 'global') {
    answer = gs.hasRole('domain_admin');
} else {
    answer = true;
}
