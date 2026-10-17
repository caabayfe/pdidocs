if (!current.allocated_to.nil())
   current.sys_class_name = 'alm_entitlement_asset';
else if (!current.assigned_to.nil())
   current.sys_class_name = 'alm_entitlement_user';
