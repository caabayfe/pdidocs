(function process(/*ResolverEnvironment*/ env) {
	var args = env.getArguments();
	var recordTable = args.recordTable;
	var recordSysId = args.recordSysId;
	var type = args.type;
	var fieldType = args.fieldType;

	var result = sn_textcommands.TextCommands.loadActions(recordTable, recordSysId, type, fieldType);

	return JSON.parse(result);

})(env);
