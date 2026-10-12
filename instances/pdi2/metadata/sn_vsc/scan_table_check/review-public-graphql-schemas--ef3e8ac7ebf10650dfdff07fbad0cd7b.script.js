(function (finding, current) {
        finding.setCurrentSource(current);
        finding.setValue('finding_details', "The GraphQL Schema named \"" + current.name  + "\" on the namespace  \"" 
			+ current.namespace + "\" does not require authentication and is available publicly.  SYS_ID: "
			+ current.sys_id); 
        finding.increment() ;

})(finding, current);
