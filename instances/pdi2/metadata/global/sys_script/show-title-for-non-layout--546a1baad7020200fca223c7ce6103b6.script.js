(function executeRule(current, previous /*null when async*/) {
	if (current.value + '' === 'true')
		new ShowHideShoppingCartWidgetTitle().updateUserPreference('false');
	else
		new ShowHideShoppingCartWidgetTitle().updateUserPreference('true');
})(current, previous);
