function onCondition() {
    var canRouteToEMS = g_scratchpad.canRouteToEMS;
    if (canRouteToEMS === 'false') {
        g_form.setMandatory('subscription_entitlement', false);
        g_form.setMandatory('license', true);
        g_form.setDisplay('subscription_entitlement', false);
        g_form.setDisplay('license', true);
    } else {
        g_form.setMandatory('subscription_entitlement', true);
        g_form.setMandatory('license', false);
        g_form.setMandatory('num_cols', false);
        g_form.setDisplay('num_cols', false);
        g_form.setDisplay('subscription_entitlement', true);
        g_form.setDisplay('license', false);
    }
}
