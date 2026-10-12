if(current.service_order != null && current.service_order != '')
	current.type = 'field_service_management';
else if(current.service_order_task != null && current.service_order_task != '')
	current.type = 'field_service';
