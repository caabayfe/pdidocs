function kbWriteComment(id, comments) {
     var fb = new GlideRecord('kb_feedback');
     fb.initialize();
     fb.article = id;
     fb.comments = unescape(comments);
     fb.insert();
}

function kbGetText(id) {
     var gr = new GlideRecord('kb_knowledge');
     if (!gr.get(id))
		 return;

	 if (gs.getProperty("glide.ui.security.allow_codetag", "true") != "true")
		 return "Knowledge article " + gr.number + ":\n" + gr.short_description;
	
     return "Knowledge article " + gr.number + ":\n" + "[code]" + gr.text + "[/code]";
}
