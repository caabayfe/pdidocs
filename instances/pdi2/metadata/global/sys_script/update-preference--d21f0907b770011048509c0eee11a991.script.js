/** When new breakdown filters are added they also need to be declared in the user's preferences. 
 * The last breakdown filter to be added will be the default one selected when the user opens the dashboard.
 * Failure to update the user prefs results in the breakdown/elements selector lists to be empty.
 */
(function executeRule(current, previous /*null when async*/) {
	var dashboardSysId = current.getValue('dashboard');
	var breakdownSrc = current.getValue('breakdown_source');
	var userPref = gs.getUser().getPreference('com.snc.pa.ui.preferences_dashboards');
	var parsedPref = parsePrefs(userPref);
	parsedPref[dashboardSysId] = breakdownSrc;
	gs.getUser().savePreference('com.snc.pa.ui.preferences_dashboards', JSON.stringify(parsedPref));
})(current, previous);

function parsePrefs(value) {
	if (!value || value === '')
		return {};
	else
		return JSON.parse(value);
}
