current.original_id = String(current.sys_id);  // need to update cert_template
if (current.operation() === 'update')
	SNC.VersionControl.insertPreventingBR(current);
