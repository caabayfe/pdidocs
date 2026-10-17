(function executeRule(current, previous /*null when async*/ ) {
    if (!current.discovery_source.changes() && current.discovery_source == 'Unknown') {
        // Reset "Unknown" discovery_source state, if CI gets updated
        current.discovery_source = '';
    }
})(current, previous);
