if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user')) {
    answer = true;
} else {
    answer = current.source_id.getRefRecord().canRead();  
}
