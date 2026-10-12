current.approval = "rejected";
current.update();


new UIActionUtils().approvalsNoLongerRequired(current.sys_id);
