var newRecordURL = current.sys_class_name + '.do?sys_id=-1';
var mlSolutionDefinitionUtils = new MLSolutionDefinitionUtils();
var uri = action.getGlideURI();
var view_uri = uri.get('sysparm_view');
var encodedQuery = mlSolutionDefinitionUtils.getMLSolutionDefinitionQueryParams(current);
if(!encodedQuery){
	gs.addErrorMessage('Error in copying solution definition');
}else{
	action.setRedirectURL(newRecordURL+'&sysparm_query='+ encodedQuery + '&sysparm_view='+ view_uri );
}
