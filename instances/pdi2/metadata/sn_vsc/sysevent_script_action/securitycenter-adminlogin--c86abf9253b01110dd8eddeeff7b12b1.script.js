/*
*Triggered upon login event, check if user is admin
*/
var constant = new sn_vsc.SecurityCenterConstants();
var usr = new GlideRecord('sys_user');
if (usr.get('user_name', event.parm1)) {
    var gr = new GlideRecord('sys_user_has_role');
    var encoded = "user=" + usr.sys_id + "^role=" + constant.AdminUser + "^ORrole=" + constant.SCUser;
    gr.addEncodedQuery(encoded);
    gr.query();
    if (gr.next()) {
        new sn_vsc.SCComparisonUtil().loginEvent(usr.sys_id);
	new sn_vsc.ScanComparisonUtil().loginEvent(usr.sys_id);
    }
}
