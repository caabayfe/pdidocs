(function executeRule(current, previous /*null when async*/) {
	var raw = current.getValue('allowed_glide_apis');
	if (gs.nil(raw))
		return; // empty = no restriction, valid

	var entries = raw.split(',');
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].trim();
		if (entry === '')
			continue;

		if (entry.indexOf('/api/') !== 0) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Allowed Glide API entry "{0}" must start with /api/ (e.g. /api/now/table/incident)', [entry]));
			return;
		}

		if (entry.indexOf('?') !== -1 || entry.indexOf('#') !== -1 || entry.indexOf('*') !== -1) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Allowed Glide API entry "{0}" must not contain ?, #, or *', [entry]));
			return;
		}

		// Strip trailing slash before counting segments.
		var normalized = entry;
		if (normalized.charAt(normalized.length - 1) === '/')
			normalized = normalized.substring(0, normalized.length - 1);

		// Minimum 3 segments: /api/<namespace>/<resource>
		// Blocks overly broad namespace wildcards like /api/now, but allows
		// collection-level prefixes like /api/now/table.
		var segments = normalized.split('/').filter(function(s) { return s !== ''; });
		if (segments.length < 3) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Allowed Glide API entry "{0}" must have at least 3 path segments (e.g. /api/now/table or /api/now/table/incident)', [entry]));
			return;
		}
	}
})(current, previous);
