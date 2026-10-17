// Client Calls
var dialog = null;

function renderDialog() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	dialog = new dialogClass('knowledge_retire_confirm_form');	
    dialog.setTitle(getMessage('Retire Confirmation'));
	dialog.setWidth(400);
	
	dialog.setPreference('sysparm_base_article_id', g_form.getUniqueValue());
	dialog.setPreference('sysparm_base_article_scope', g_form.getReference('kb_knowledge_base').getValue('application'));
    dialog.setPreference('sysparm_parent_form', this);
    dialog.render();
}

function destoryDialog() {
	dialog.destroy();
	gsftSubmit(null, g_form.getFormElement(), "retire_replacement");
}

// Server Calls
function retireKnowledge() {
	var kbKnowledge = new KBKnowledge();
	kbKnowledge.retireKnowledgeById(current.getUniqueValue());
}

function retireKnowledgeWithReplacement(replacementArticleId) {
	var kbKnowledge = new KBKnowledge();
	kbKnowledge.retireKnowledgeWithReplacementByIds(current.getUniqueValue(), replacementArticleId);
}

if(typeof window == 'undefined') {
	var replacementArticleId = gs.getSession().getClientData('replacementArticleId_' + current.getUniqueValue()) + '';
	gs.nil(replacementArticleId) ? retireKnowledge() : retireKnowledgeWithReplacement(replacementArticleId);
}
