(function executeRule(current, previous /*null when async*/ ) {
    current.local_or_existing = current.securityAttribute.is_localized ? 'Local' : 'Existing';
})(current, previous);
