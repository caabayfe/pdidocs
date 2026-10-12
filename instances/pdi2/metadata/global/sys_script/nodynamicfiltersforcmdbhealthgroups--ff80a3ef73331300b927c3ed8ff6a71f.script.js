var table = current.getValue('class');
var encodedQuery = new GlideQueryString();
encodedQuery.init(table, current.condition);

encodedQuery.deserialize();
var conditions = encodedQuery.getTerms();
var dynamic = 'DYNAMIC';

for ( var i = 0; i < conditions.size(); i++) {
	var condition = conditions.get(i);

	var oper = '' + condition.getOperator();
	if (oper === dynamic) {
		gs.addErrorMessage(gs.getMessage("Dynamic filters are not supported for CMDB Health Groups"));
		current.setAbortAction(true);
		break;
	}
}
