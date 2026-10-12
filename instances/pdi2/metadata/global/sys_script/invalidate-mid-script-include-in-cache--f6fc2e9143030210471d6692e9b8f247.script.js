(function executeRule(current, previous /*null when async*/ ) {

	var invalidateCache = new InvalidateMIDScriptCache();
    invalidateCache.invalidateMidScriptIncludeCache(current.document_id);

    if (current.document_id.changes()) {
		invalidateCache.invalidateMidScriptIncludeCache(previous.document_id);
    }

})(current, previous);
