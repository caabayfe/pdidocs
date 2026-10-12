function onLoad() {
    var ajax = new GlideAjax('KBAjax');
    ajax.addParam('sysparm_type', 'isPluginActive');
    ajax.addParam('sysparm_name', 'com.glide.cs.chatbot');
    ajax.getXML(isValid);
	
    function isValid(res) {
		//holds the plugin active status(true/false)
        var answer = res.responseXML.documentElement.getAttribute('answer');
		//only on article new/ checkout this info message should be visible.
        if (answer == 'true' && g_form.getValue('workflow_state') == 'draft' && g_scratchpad.articleTemplate == 'kb_template_faq')
            g_form.addInfoMessage(getMessage('The FAQ is used in Virtual Agent conversations. To improve the Virtual Agent experience for your users, write concise answers.'));

    }
}
