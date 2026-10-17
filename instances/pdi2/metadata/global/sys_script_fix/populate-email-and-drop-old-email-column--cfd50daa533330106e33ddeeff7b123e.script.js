var gr = new GlideRecord("mp_collaborators");
if (gr.isValid()) {
	gr.query();
	while (gr.next()) {
		gr.email = gr.collaborator_email;
		gr.collaborator_email = "";
		gr.update();
	}
	gs.dropColumn('mp_collaborators', 'collaborator_email');
}
