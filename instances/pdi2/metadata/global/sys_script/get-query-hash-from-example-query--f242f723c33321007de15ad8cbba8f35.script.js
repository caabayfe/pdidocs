function onBefore(current, previous) {
	// Check if the current record's 'sys_class_name' field is 'sys_query_pattern_rewrite'
    if (current.getValue('sys_class_name') === 'sys_query_pattern_rewrite') {
        // If true, set the 'query_hash' field to special value, -2
        current.query_hash = -2;
    } else {
        // Otherwise, set the 'query_hash' field to the hash of 'example_query'
        current.query_hash = GlideQueryHasher.getQueryHash(current.getValue('example_query'));
    }
}
