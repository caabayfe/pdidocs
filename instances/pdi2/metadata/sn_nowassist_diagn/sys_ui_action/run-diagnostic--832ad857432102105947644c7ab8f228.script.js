try {
	var executionId = new NowAssistDiagnosticExcecutor().execute(current.sys_id);
	var redirectGr = new GlideRecord("sn_nowassist_diagn_execution_result");
	redirectGr.get(executionId);
	action.setRedirectURL(redirectGr);
} catch(e) {
	gs.addErrorMessage(e.message);
	action.setRedirectURL(current);
}
