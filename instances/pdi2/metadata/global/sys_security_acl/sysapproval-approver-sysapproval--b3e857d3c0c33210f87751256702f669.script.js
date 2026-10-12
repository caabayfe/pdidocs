if (current.isNewRecord()) {
    answer = (current.sysapproval.sys_class_name == 'sc_request' || current.sysapproval.sys_class_name == 'sc_req_item' || current.sysapproval.sys_class_name == 'sc_task');
} else {
    answer = false;
}
