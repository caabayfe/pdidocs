current.state = 'ready';
current.processed = "NULL";
current.processing_duration = "NULL";
if(current.isValidField('deferred_count'))
	current.deferred_count = 0;
if(current.isValidField('completed_sysrules'))
	current.completed_sysrules = "";
if(current.isValidField('partition'))
	current.partition = "";
current.insert();
