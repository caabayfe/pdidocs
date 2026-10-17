(function executeRule(current, previous /*null when async*/ ) {
    sys_security_acl.local_or_existing = sys_security_acl.security_attribute.is_localized ? 'Local' : 'Existing';
})(current, previous);
