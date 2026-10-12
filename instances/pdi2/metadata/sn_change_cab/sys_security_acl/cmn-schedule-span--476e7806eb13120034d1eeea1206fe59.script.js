var allow = false;
if (!current.schedule.nil())
	allow = current.schedule.sys_class_name == sn_change_cab.CAB.DEFINITION;

allow;
