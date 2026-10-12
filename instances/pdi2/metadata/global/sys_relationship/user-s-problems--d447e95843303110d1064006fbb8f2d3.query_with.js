var callerID = parent.opened_for;
var guestUserSysID = '5136503cc611227c0183e96598c4f706';
if (JSUtil.notNil(callerID) && callerID.getValue() !== guestUserSysID) {
    current.addEncodedQuery("active=true^opened_by=" + callerID + "^ORDERBYDESCsys_created_on");
} else
    current.addEncodedQuery("sys_idISEMPTY");
