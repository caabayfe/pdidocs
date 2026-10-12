current.request_state = 'closed_cancelled';
current.update();


new UIActionUtils().approvalsNoLongerRequired(current.sys_id);
