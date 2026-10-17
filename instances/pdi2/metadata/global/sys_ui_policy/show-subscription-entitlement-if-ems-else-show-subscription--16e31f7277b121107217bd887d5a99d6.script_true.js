function onCondition() {
    var canRouteToEMS = g_scratchpad.canRouteToEMS;
    if (canRouteToEMS === 'false') {
        g_form.setDisplay('subscription_entitlement', false);
        g_form.setDisplay('license', true);
    } else {
        g_form.setDisplay('subscription_entitlement', true);
        g_form.setDisplay('license', false);
    }
}
