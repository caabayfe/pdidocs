if (current.isNewRecord()) {
    answer = (current.sysapproval.sys_class_name == 'change_request' || current.sysapproval.sys_class_name == 'std_change_proposal');
} else {
    answer = false;
}
