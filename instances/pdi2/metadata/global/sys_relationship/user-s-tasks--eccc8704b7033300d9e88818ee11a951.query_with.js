var callerID = parent.opened_for;
var guestUserSysID = '5136503cc611227c0183e96598c4f706';
if (JSUtil.notNil(callerID) && callerID.getValue() !== guestUserSysID) {
    var inc = "sys_class_name=incident^active=true^ref_incident.caller_id=" + callerID;
    var prb = "sys_class_name=problem^active=true^opened_by=" + callerID;
    var chg = "sys_class_name=change_request^active=true^ref_change_request.requested_by=" + callerID;
    var scr = "sys_class_name=sc_request^active=true^ref_sc_request.requested_for=" + callerID;
    current.addEncodedQuery(inc + "^NQ" + prb + "^NQ" + chg + "^NQ" + scr + "^ORDERBYDESCsys_created_on");
} else
    current.addEncodedQuery("sys_idISEMPTY");
