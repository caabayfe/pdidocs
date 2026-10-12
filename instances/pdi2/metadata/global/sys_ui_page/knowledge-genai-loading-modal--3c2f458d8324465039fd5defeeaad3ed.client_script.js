eval("import('/uxasset/externals/@devsnc/library-uxf/index.jsdbx?sysparm_substitute=false').then(({ getComponentsByTagNames }) => { Object.assign(history, { pushState, replaceState }); getComponentsByTagNames(['now-animation']);});");
function closeLoadingModal() {
	
    var modal = new GlideModal().get('knowledge_genAI_loading_modal');
    modal.destroy();
    g_form.addFormMessage(getMessage("AI is still working on drafting this article."), 'suggestion');
}
