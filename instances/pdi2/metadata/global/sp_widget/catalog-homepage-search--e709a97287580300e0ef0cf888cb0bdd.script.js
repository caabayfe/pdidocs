/* Secure access check for the options.table */
function checkSecurityAccess() {
	if (options.table && !new global.SPWidgetAccessControl().hasPublicAccess(options.table, $sp, options, input)) {
		gs.warn("Deny access to table which is not public: " + options.table);
		return false;
    } else
		return true;
}

if (checkSecurityAccess()) {
    if ($sp.isAISearchEnabled())
        data.typeAheadSearch = $sp.getWidget('typeahead-search', options);
    else
        data.typeAheadSearch = $sp.getWidget('typeahead-search', options.typeahead_search);
}
