(function() {
	var AST_SERVICE = "ast_service";
	var AST_CONTRACT = "ast_contract";
	var CUSTOMER = "customer";
	var COVERS = "covers";

	// Check ast_service exists
	var astService = new GlideRecord(AST_SERVICE);
	if (!astService.isValid())
		return;

	// Promote the columns
	GlideDBUtil.promoteColumn(AST_SERVICE, AST_CONTRACT, CUSTOMER);
	GlideDBUtil.promoteColumn(AST_SERVICE, AST_CONTRACT, COVERS);
})();
