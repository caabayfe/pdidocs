var SearchHealthMetricDefinitionMessageSync = Class.create();

/*
 * sys_ui_message has no reference back to the record that registered a key, so CODE_PREFIX + the
 * definition's sys_id is the only way to scope a row to "this definition's messages" - it is what lets
 * two definitions register the identical key text without colliding, and what a re-sync uses to find
 * exactly the rows one definition produced, and no others.
 *
 * Plain GlideRecord throughout, matching SysMessage.insertEntry()'s own convention for this table: this
 * only ever runs from a Business Rule already scoped to the definition's own save, not as a general
 * entry point the way SearchHealthMetricOrchestrator is, so there is no caller whose rights need
 * separately enforcing here.
 *
 * setWorkflow(false) on every insert/delete below, again matching SysMessage.insertEntry()'s convention
 * for this table: this is system bookkeeping reacting to a definition save, not a user editing a message,
 * so it should not ripple into whatever else is wired to sys_ui_message (audit history, any BR a site has
 * added there) any more than the platform's own lazy insert does.
 */
SearchHealthMetricDefinitionMessageSync.prototype = {
	initialize: function() {},

	/**
	 * Diffs the definition's messages field against the sys_ui_message rows already scoped to it: adds a
	 * row for a key that has none, removes a row for a key no longer listed, and never touches the message
	 * value of a row that survives the diff - so a translation already entered for a key that is still
	 * listed is preserved across an unrelated save of the definition.
	 */
	syncMessages: function(definition) {
		var code = this.CODE_PREFIX + definition.getUniqueValue();
		var keys = this.parseMessages(definition.getValue('messages'));

		var existingIds = {};
		var existing = new GlideRecord('sys_ui_message');
		existing.addQuery('code', code);
		existing.addQuery('language', this.DEFAULT_LANGUAGE);
		existing.query();
		while (existing.next())
			existingIds[existing.getValue('key')] = existing.getUniqueValue();

		for (var i = 0; i < keys.length; i++) {
			if (existingIds.hasOwnProperty(keys[i]))
				continue;

			var toInsert = new GlideRecord('sys_ui_message');
			toInsert.initialize();
			toInsert.setValue('key', keys[i]);
			toInsert.setValue('language', this.DEFAULT_LANGUAGE);
			toInsert.setValue('message', keys[i]);
			toInsert.setValue('code', code);
			toInsert.setWorkflow(false);
			toInsert.insert();
		}

		var stillListed = {};
		for (var j = 0; j < keys.length; j++)
			stillListed[keys[j]] = true;

		for (var existingKey in existingIds) {
			if (stillListed.hasOwnProperty(existingKey))
				continue;

			var toDelete = new GlideRecord('sys_ui_message');
			if (toDelete.get(existingIds[existingKey])) {
				toDelete.setWorkflow(false);
				toDelete.deleteRecord();
			}
		}
	},

	/**
	 * One key/template per line, the same convention sys_script_client.messages uses: trimmed, blank
	 * lines dropped, duplicates within one definition collapsed since two lines naming the same key would
	 * otherwise be indistinguishable to the diff above. Not prefixed with an underscore - the "Validate
	 * Messages Field Length" Business Rule calls this too, so parsing stays in exactly one place rather
	 * than risking the two rules drifting out of sync on what counts as a key.
	 *
	 * Deliberately not truncated: this is what the validate rule checks lengths against, and truncating
	 * first would hide exactly the lines it needs to see in full to report a useful length in its error
	 * message. {@link #parseMessages} is the truncated form the sync uses to write to sys_ui_message.
	 */
	splitMessageLines: function(messages) {
		var keys = [];
		if (!messages)
			return keys;

		var seen = {};
		var lines = messages.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var key = lines[i].trim();
			if (!key || seen.hasOwnProperty(key))
				continue;

			seen[key] = true;
			keys.push(key);
		}
		return keys;
	},

	/**
	 * {@link #splitMessageLines}, truncated to MAX_KEY_LENGTH: sys_ui_message.key is max_length 255, and
	 * the platform truncates a string field silently on write. Without truncating here first, a diff
	 * against the (already truncated) stored row would compare it to the full, untruncated line and never
	 * find a match, so every save would try to re-insert the same key. The validate rule is what keeps
	 * this from mattering in practice - it rejects an oversized line before it ever reaches this method -
	 * but truncating here too means a record written some other way (a background script with
	 * setWorkflow(false), a direct data load) still gets a self-consistent sync instead of a silent,
	 * repeating mismatch.
	 */
	parseMessages: function(messages) {
		var lines = this.splitMessageLines(messages);
		var keys = [];
		var seen = {};
		for (var i = 0; i < lines.length; i++) {
			var key = lines[i].substring(0, this.MAX_KEY_LENGTH);
			if (seen.hasOwnProperty(key))
				continue;

			seen[key] = true;
			keys.push(key);
		}
		return keys;
	},

	CODE_PREFIX: 'sys_search_health_metric_definition_',
	DEFAULT_LANGUAGE: 'en',
	MAX_KEY_LENGTH: 255,

	type: 'SearchHealthMetricDefinitionMessageSync'
};
