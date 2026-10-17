function NiceError(message) {
    this.message = message;
    this.stack = NiceError.getStackTrace(3);
    this.time = new Date();
}

NiceError.prototype = Object.create(Error.prototype);

NiceError.prototype.toString = function toString() {
    return '['
        + this.time.toISOString()
        + ']: '
		+ this.message
		+ '\n-------- STACK TRACE ---------\n'
		+ this.stack
		+ '------------------------------\n';
};

NiceError.getStackTrace = function getStackTrace(topLinesToRemove) {
	try {
		new _ThisIsFine_(); // eslint-disable-line no-new
	} catch (err) {
		return NiceError._makeStackTraceFriendly(err.stack, topLinesToRemove);
	}
	throw new Error('getStackTrace() failed to retrieve stack trace');
};

NiceError._makeStackTraceFriendly = function _makeStackTraceFriendly(stackTrace, topLinesToRemove) {
	var stacktrace = NiceError._stripIndentationFromStackTrace(stackTrace, topLinesToRemove);
	var scriptTables = NiceError._getDistinctScriptTables(stacktrace);
	var friendlyNames = NiceError._getFriendlyScriptNamesForEachTableWithId(scriptTables);
	return NiceError._addScriptNamesToStackTrace(stacktrace, friendlyNames);
};

NiceError._stripIndentationFromStackTrace = function _stripIndentationFromStackTrace(stacktrace, topLinesToRemove) {
	return stacktrace
		.split('\n')
		.slice(topLinesToRemove)
		.map(function (line) { return line.trim(); })
		.join('\n');
};

NiceError.SCRIPT_TABLES_WITH_NAME_FIELD = {
	sys_script: 'name',
	sys_trigger: 'name',
	sys_atf_step: 'test.name',
	sys_ui_action: 'name',
	sysauto_script: 'name',
	sys_script_fix: 'name',
	sys_web_service: 'name',
	sys_script_include: 'name',
	sc_cat_item_producer: 'name',
	sys_transform_script: 'map.name',
};

NiceError.LINE_REGEX = new RegExp(
	'(' + Object.keys(NiceError.SCRIPT_TABLES_WITH_NAME_FIELD).join('|') + ')\\.[0-9a-f]{32}',
	'g'
);

NiceError._getDistinctScriptTables = function _getDistinctScriptTables(stacktrace) {
	return Object.keys((stacktrace.match(NiceError.LINE_REGEX) || [])
		.reduce(function (acc, line) {
			acc[line] = true;
			return acc;
		}, {}));
};

NiceError._friendlyNameCache = {};
NiceError._getFriendlyScriptNamesForEachTableWithId = function _getFriendlyScriptNamesForEachTableWithId(scriptTables) {
	return scriptTables
		.reduce(function (acc, line) {
			if (NiceError._friendlyNameCache[line]) {
				acc[line] = NiceError._friendlyNameCache[line];
			} else {
				var tableAndId = line.split('.');
				var table = tableAndId[0];
				var id = tableAndId[1];
				var gr = new GlideRecord(table);
				if (gr.get(id)) {
					var element = gr.getElement(NiceError.SCRIPT_TABLES_WITH_NAME_FIELD[table]);
					if (element) {
						var scope = NiceError._getScope(gr);
						acc[line] = scope + "'" + element.getValue() + "'";
						NiceError._friendlyNameCache[line] = acc[line];
					}
				}
			}
			return acc;
		}, {});
};

NiceError._getScope = function (glideRecord) {
	var scopeElement = glideRecord.getElement('sys_scope.scope');
	return scopeElement
		? '[' + scopeElement.getValue() + '] '
		: '';
};

NiceError._addScriptNamesToStackTrace = function _addScriptNamesToStackTrace(stackTrace, friendlyNames) {
	var stacktraceWithScriptNames = Object.keys(friendlyNames)
		.reduce(function (acc, line) {
			var tableAndId = line.split('.');
			var table = tableAndId[0];
			var id = tableAndId[1];
			var toReplace = new RegExp(line + '(.script)?', 'g');
			return acc.replace(toReplace, friendlyNames[line] + " [" + table + ':' + id + ']');
		}, stackTrace);
	if (current && current instanceof GlideRecord && stacktraceWithScriptNames.contains('<refname>')) {
		var table = current.getTableName();
		var name = current.getDisplayValue();
		var id = current.getUniqueValue();
		var scope = NiceError._getScope(current);
		var line = scope + "'" + name + "' [" + table + ':' + id + ']';
		stacktraceWithScriptNames = stacktraceWithScriptNames.replace(/<refname>/g, line);
	}
	return stacktraceWithScriptNames.replace(/null.null.script/g, '[background script]');
};

/**
 * Calls `gs.error()` with error message then throws an Error with the same message.
 * Creates a more developer-friendly stack trace than normally provided by the platform.
 * @param {string} errorMessage
 * @throws {Error}
 */
NiceError.raise = function raise(errorMessage) {
	var error = new NiceError(errorMessage);

	if (typeof (jasmine) === 'undefined') {
        GlideSysLog.error('NiceError', error.toString());
	}

	throw error;
};
