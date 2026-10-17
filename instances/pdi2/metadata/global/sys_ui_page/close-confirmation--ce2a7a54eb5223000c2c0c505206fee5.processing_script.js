if(selection_result == 'close') {
	var gr = new GlideRecordSecure("interaction");
    if (gr.get(my_sys_id)) {
    	gr.state = 'closed_complete';
		gr.update();
	}
}
response.sendRedirect(gs.getUrlOnStack());
