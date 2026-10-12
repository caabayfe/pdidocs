var user = gs.getUser();
if (user.hasRole('nlu_admin') || (user.hasRole('nlu_editor') && current.sys_created_by == gs.getUserName())) {
    answer = true;
} else {
    answer = false;
}
