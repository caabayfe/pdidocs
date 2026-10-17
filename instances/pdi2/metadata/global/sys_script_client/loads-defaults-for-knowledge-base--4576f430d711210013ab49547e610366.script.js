function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '' || (isLoading && !g_form.isNewRecord())) return;

    var gr = new GlideRecord('kb_knowledge_base');
    gr.addQuery("sys_id", newValue);
    gr.query(recResponse);

    function recResponse(gr) {
        if (gr.next() && gr.template) {
            if (typeof g_modal !== 'undefined') {
				//calling default pop up for Workspace article create form 
                g_modal.showFrame({
                    title: getMessage("Apply Default Values"),
                    url: '/kb_confirm_defaults_workspace.do?sysparm_template=' + encodeURIComponent(gr.template),
                    size: 'sm',
                    autoCloseOn: 'URL_CHANGED'
                });
            } else if (typeof GlideModal !== 'undefined') {
				//calling default pop up for standard article create form 
                var confirm = new GlideModal('kb_confirm_defaults');
                confirm.setTitle(new GwtMessage().getMessage("Apply Default Values"));
                confirm.setPreference('template', gr.template);
                confirm.render();
            } 
        }
    }
}

function messageHandler(e) {
    if (e.data.dialogAction === "MODAL_KB_DEFAULT_APPLY_CONFIRM") {
        for (var key in e.data.response) {
            g_form.setValue(key, e.data.response[key]);
        }
    }
}
addEventListener("message", messageHandler);
