var u = new GlideRecordSecure('sys_user_group');
var a = new global.DocumentObjectSecurity();
answer = u.canRead() && a.canWritePermission(current);
