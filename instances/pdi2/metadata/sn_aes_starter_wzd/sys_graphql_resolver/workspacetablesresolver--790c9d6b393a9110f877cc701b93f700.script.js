(function process( /*ResolverEnvironment*/ env) {
    try {
       var filterTables = env.getArguments().filterTables || "";
        var scope = env.getArguments().scope;
        var initialLoad = env.getArguments().initialLoad;
        var inputText = env.getArguments().inputText ? env.getArguments().inputText : "";
		var queryString = inputText ? "nameSTARTSWITH"+inputText+"^ORlabelSTARTSWITH"+inputText : "";
        var tables_output = {
            "inScopeTables": [],
            "outOfScopeTables": [],
            "status": ""
        };
        var si = new sn_workspace_sta_0.StarterWorkspace();
        if (scope) {
            var data = si.fetchTables(true, queryString, filterTables, inputText, scope);
            tables_output.inScopeTables = data;
            tables_output.status = "Success";
            if (initialLoad) return tables_output;
        }
        tables_output.outOfScopeTables = si.fetchTables(false, queryString, filterTables, inputText, scope);
        tables_output.status = "Success";
        return tables_output;
    } catch (ex) {
        gs.error("GraphQL error occoured at WorkspaceTablesResolver " + ex);
        tables_output.status = "Error: "+ex.message;
        return tables_output;
    }

})(env);
