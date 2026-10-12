function onCondition() {

	function showRelatedListSubscriptionView(canRouteToEMS) {
		var view = g_form.getViewName();
		if (view == 'subscription') {
			if (canRouteToEMS) {
				g_form.showRelatedList('REL:f561524f773121107217bd887d5a9989');
				g_form.hideRelatedList('REL:fdbbad1673221010c79260bdfaf6a73b');
			} else {
				g_form.showRelatedList('REL:fdbbad1673221010c79260bdfaf6a73b');
				g_form.hideRelatedList('REL:f561524f773121107217bd887d5a9989');
			}
		}
	}

    var canRouteToEMS = g_scratchpad.canRouteToEMS;
    if (canRouteToEMS === 'false') {
        g_form.setDisplay('subscription_entitlement', false);
        g_form.setDisplay('license', true);
        showRelatedListSubscriptionView(false);
    } else {
        g_form.setDisplay('subscription_entitlement', true);
        g_form.setDisplay('license', false);
        showRelatedListSubscriptionView(true);
    }
}
