function onLoad() {
    //Type appropriate comment here, and begin script below
    if (!g_form.isNewRecord()) {
        var id = g_form.getUniqueValue();
        var timestamp = Date.now();

        /*var url = '/now/clone/ui/clone-status/' + id + '/' + timestamp;
        var messageTemplate = getMessage("clone.view_in_console_with_link");
        
        // Build link HTML
        var link = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' +
                   getMessage("CLONE_OPEN_CONSOLE_LINK_TEXT") + 
                   '</a>';

		//View this record within the Clone Admin Console for a better experience: link

        var fullMessage = messageTemplate.replace('{0}', link);*/

        // Build URL without string concatenation operator
        var urlTemplate = '/now/clone/ui/clone-status/{0}/{1}';
        var url = urlTemplate.replace('{0}', id).replace('{1}', timestamp);

        // Get translated link text
        var linkText = getMessage("CLONE_OPEN_CONSOLE_LINK_TEXT");

        // Build link using replace pattern instead of concatenation
        var linkTemplate = '<a href="{URL}" target="_blank" rel="noopener noreferrer">{TEXT}</a>';
        var linkHtml = linkTemplate
            .replace('{URL}', url)
            .replace('{TEXT}', linkText);


        // Get message template and insert link
        var messageTemplate = getMessage("clone.view_in_console_with_link");
        var fullMessage = messageTemplate.replace('{0}', linkHtml);

        g_form.addInfoMessage(fullMessage);
    }
}
