current.audit_type = current.template.audit_type;
current.table = current.template.table;
current.filter = current.template.filter;
if (current.operation() === 'insert')
	current.last_run_date = "";
