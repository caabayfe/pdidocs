(function process(/*ResolverEnvironment*/ env) {

    var args = env.getArguments();
	var recordTable = args.recordTable;
	var recordSysId = args.recordSysId;
	var commandId = args.commandId;
	var query = args.query;

	var result = sn_textcommands.TextCommands.invokeAction(commandId, query, recordTable, recordSysId);

	return JSON.parse(result);

})(env);
