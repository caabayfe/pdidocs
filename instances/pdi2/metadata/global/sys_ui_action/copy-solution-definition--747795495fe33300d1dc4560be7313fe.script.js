var newRecordURL = current.sys_class_name + '.do?sys_id=-1';
var mlSolutionDefinitionUtils = new MLSolutionDefinitionUtils();
var uri = action.getGlideURI();
var encodedQuery = mlSolutionDefinitionUtils.getMLSolutionDefinitionQueryParams(current);
if(!encodedQuery){
	action.setRedirectURL(current);
	gs.addErrorMessage('Error in copying solution definition');
}else{
	action.setRedirectURL(newRecordURL+'&sysparm_query='+ encodedQuery);
}
