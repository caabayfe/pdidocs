if (current.cmdb_ci_service.sys_class_name.getValue() === 'service_offering')
	answer = (new global.SPMUtilsFactory().getUtils()).checkOfferingAuthorization(current.cmdb_ci_service);
else if (current.cmdb_ci_service.sys_class_name.getValue() === 'cmdb_ci_service')
	answer = (new global.SPMUtilsFactory().getUtils()).checkServiceAuthorization(current.cmdb_ci_service);
