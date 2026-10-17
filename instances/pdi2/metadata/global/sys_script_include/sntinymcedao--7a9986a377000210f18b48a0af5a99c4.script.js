var SnTinyMCEDAO = function() {
    // Gets the tinymce v5 props that should be copied over to v6+ properties
    var getV5Props = function() {
        // Lets get all the necessary v5 sys-properties
        var v5SysPropsGR = new GlideRecord('sys_properties');
        v5SysPropsGR.addEncodedQuery(
            'nameINglide.ui.html.editor.v5.languages,glide.ui.html.editor.v5.enabled_plugins,glide.ui.html.editor.v5.toolbar,glide.ui.html.editor.v5.font.collection,glide.ui.html.editor.v5.paste.word_import,glide.ui.html.editor.v5.paste.html_import,glide.ui.html.editor.v5.toolbar.valid_buttons,glide.ui.html.editor.v5.valid_plugins'
        );
        v5SysPropsGR.query();

        // Map the records
        var v5Props = {};
        while (v5SysPropsGR.next()) {
            v5Props[v5SysPropsGR.getValue('name')] = v5SysPropsGR.getValue('value');
        }

        return v5Props;
    };
    return {
        getV5Props: getV5Props
    };
};
