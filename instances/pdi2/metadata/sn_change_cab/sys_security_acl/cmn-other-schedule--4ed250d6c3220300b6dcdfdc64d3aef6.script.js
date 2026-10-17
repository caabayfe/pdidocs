var allow = false;
if (typeof parent !== "undefined" && parent)
	allow = sn_change_cab.CAB.DEFINITION === parent.sys_class_name + "";
else if (typeof current !== "undefined" && current)
	allow = sn_change_cab.CAB.DEFINITION === current.schedule.sys_class_name + "";

allow;
