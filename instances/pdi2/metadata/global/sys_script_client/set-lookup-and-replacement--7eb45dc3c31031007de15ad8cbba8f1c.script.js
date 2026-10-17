function onLoad() {
	_checkCapabilities();
}

function setLookupAndReplacement() {
    var shortTableName = g_form.getValue('table_name');
    var alias = new GlideRecord("sys_storage_table_alias");
    alias.addQuery("table_name", "=", shortTableName);
    alias.query();
    if (alias.next()) {
        shortTableName = alias.storage_alias;
    }
	// PG follows different index hint syntax
	_checkCapabilities();
	if (_isPgEngineType()) {
		_setLookupAndReplacementPG(shortTableName);
		return;
	}

    var lookup = shortTableName + ' ' + g_form.getValue('correlation_name');
    var replacement = lookup + ' ' + g_form.getValue('hint_type') + ' index (' + g_form.getValue('index_name') + ')';
    g_form.setValue('lookup_key', lookup);
    g_form.setValue('replacement', replacement);
}

function _checkCapabilities() {
	// On MariaDB, restore 'use index' option
	if (!_isPgEngineType()) {
		g_form.addOption('hint_type','use', 'USE INDEX'); // I18N 
		g_form.setMandatory('change_number', false);
		return;
	}
	// On PG, hide 'use index'
	// Also check if pg_hints are supported and show info message if not, so that the user understands that it will not work
	g_form.removeOption('hint_type','use');
	g_form.setMandatory('change_number', true); // change_number is mandatory 
	var ajax = new GlideAjax('IndexHintQueryRewriteAjax');
	ajax.addParam('sysparm_name', 'isPgHintSupported');
	ajax.addParam('sysparm_table', g_form.getValue('table'));
	ajax.getXMLAnswer(function(supported) {
		jslog('_checkCapabilities isPgHintSupported ' + supported);
		if (supported != 'true')
			g_form.hideFieldMsg('engine'); // Prevent stacking if called repeatedly
			g_form.showFieldMsg('engine', "Caution: Primary database does not support pg_hint_plan extension.");

	});

}

function _isPgEngineType() {
	return g_form.getValue('engine') == 'postgresql';
}

function _setLookupAndReplacementPG(shortTableName) {
	var ajax = new GlideAjax('IndexHintQueryRewriteAjax');
	ajax.addParam('sysparm_name', 'getIndexHintForTableAndColumns');
	ajax.addParam('sysparm_table', shortTableName);
	ajax.addParam('sysparm_correlationName', g_form.getValue('correlation_name'));
	ajax.addParam('sysparm_hintType', g_form.getValue('hint_type'));
	ajax.addParam('sysparm_indexColumns', g_form.getValue('index_name'));
	ajax.addParam('sysparm_engine', g_form.getValue('engine'));
	ajax.addParam('sysparm_changeNumber', g_form.getValue('change_number'));

	ajax.getXMLAnswer(function(replacement) {
		g_form.setValue('replacement', replacement);
		g_form.setValue('type', 'regex_replacement');
		updateExampleRewrite();
	});
}
