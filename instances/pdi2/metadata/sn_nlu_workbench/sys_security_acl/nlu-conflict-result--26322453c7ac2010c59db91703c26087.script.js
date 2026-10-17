var user = gs.getUser();
if (user.hasRole('nlu_admin') || (user.hasRole('nlu_editor') && current.conflict_execution.sys_created_by == gs.getUserName())) {
    answer = true;
} else {
    answer = false;
}
