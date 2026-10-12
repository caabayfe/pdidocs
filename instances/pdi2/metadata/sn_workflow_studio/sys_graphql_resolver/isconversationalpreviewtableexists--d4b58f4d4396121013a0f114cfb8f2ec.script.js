(function process(/*ResolverEnvironment*/ env) {
    // implement data resolver here
	try {
    var isConversationalPluginInstalled = GlidePluginManager().isActive('com.sn_conv_fa');
		if (isConversationalPluginInstalled) {
			var tableName = env.getArguments().table_name;
			return gs.tableExists(tableName);
		}
	}catch (error) {
        gs.info('Error in isConversationalPreviewTableExists GraphQL Scripted Resolver ' + error);
  }
  return false;
})(env);
