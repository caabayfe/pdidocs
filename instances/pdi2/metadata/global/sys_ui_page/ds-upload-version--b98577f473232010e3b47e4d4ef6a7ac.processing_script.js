if (url) {
    var gr = new GlideRecord('ds_document_version');
    gr.document = documentId;
    gr.url = url;
    gr.type = 'url';
	gr.notes = notes_url;
    gr.insert();
}
var urlOnStack = GlideSession.get().getStack().bottom();
response.sendRedirect(urlOnStack);
