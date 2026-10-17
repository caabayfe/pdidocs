current.approval = "approved";
current.update();

new UIActionUtils().approvalsNoLongerRequired(current.sys_id);
