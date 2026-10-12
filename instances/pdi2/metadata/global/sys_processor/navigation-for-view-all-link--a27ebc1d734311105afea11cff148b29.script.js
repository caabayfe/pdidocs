(function process(g_request, g_response, g_processor) {
    var tableName = g_request.getParameter("sysparm_tableName");
    var searchTerm = g_request.getParameter("sysparm_term").replaceAll(
			'&',
			encodeURIComponent('&')
		);
    var url = gs.getProperty('com.glide.search.list_view_url_path', '/now/nav/ui/classic/params/target/') + tableName + "_list.do" + encodeURIComponent('?sysparm_query=GOTO123TEXTQUERY321=' + searchTerm);

    gs.addInfoMessage(gs.getMessage("Your search has been re-run but the results could be different"));
    g_response.sendRedirect(url);


})(g_request, g_response, g_processor);
