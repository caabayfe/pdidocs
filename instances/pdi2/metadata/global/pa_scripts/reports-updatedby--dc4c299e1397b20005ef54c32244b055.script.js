var getUserSysID = function(userID) {
	var gr = new GlideRecord('sys_user');
	gr.get('user_name', userID);
	return gr.getUniqueValue();
};
getUserSysID(current.sys_updated_by);
