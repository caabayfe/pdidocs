(function executeRule(current, previous /*null when async*/ ) {

    // If the user has any of the admin or power user roles allow the action.
    if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user'))
        return;

})(current, previous);
