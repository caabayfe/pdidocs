var authType = gs.getSession().getProperty('mid_auth.auth_type');
if (authType == 'ipki') {
    answer = (current.sys_id == gs.getSession().getProperty('mid_auth.mid_sys_id'));
} else {
    answer = (current.is_using_custom_cert == true);
}
