if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user')) {
    answer = true;
} else {
    answer = (current.isNewRecord() || current.sys_created_by == gs.getUserName());
}
