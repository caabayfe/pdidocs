(function process(g_request, g_response, g_processor) {

	//Add user session trigger flag to start the conflict detection UI
	gs.getSession().putClientData('run_conflict_ui','true');
	
	//Redirect the user back to the change form.
	g_response.sendRedirect('change_request.do?' + g_request.getQueryString());

})(g_request, g_response, g_processor);
