current.addQuery('sys_class_name', 'alm_entitlement_asset');
current.addQuery('allocated_to.sys_id', parent.ci.sys_id);
current.addQuery('allocated_to.sys_id','!=','');
