function execute() {
	if (event.parm1 !== null && event.parm1 !== undefined) {
		var affectedTables = event.parm1.substring(0).split(',');
		if (affectedTables !== null && affectedTables !== undefined && affectedTables.length > 0)  {
			if (affectedTables.indexOf('sys_certificate') > -1)
				gs.eventQueue('instance.key.registry', current, 'Imported From Update Set');	
		}
	}
}
execute();
