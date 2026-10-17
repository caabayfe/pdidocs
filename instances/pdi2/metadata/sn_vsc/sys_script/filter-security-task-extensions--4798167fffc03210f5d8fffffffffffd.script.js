(function executeRule(current, previous /*null when async*/ ) {
    current.addQuery('sys_class_name', 'sn_vsc_security_task');
    if (gs.hasRole('sn_vsc.security_center_admin'))
        return;
    if (gs.hasRole("access_analyzer_admin") || gs.hasRole("user_admin"))
        current.addQuery('type', 'access_finding');
})(current, previous);
