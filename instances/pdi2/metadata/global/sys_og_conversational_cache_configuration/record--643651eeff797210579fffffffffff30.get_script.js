(function() {
    function processTemplateMessages(template) {
        var messages = {};

        // Matches $t("...") or $t('...'), supporting escaped quotes (\", \') and multiline keys
        return template.replace(/\$t\(\s*(?:"((?:[^"\\]|\\[\s\S])*)"|'((?:[^'\\]|\\[\s\S])*)')\s*\)/g,
            function(match, doubleQuotedKey, singleQuotedKey) {
                var raw = doubleQuotedKey != null ? doubleQuotedKey : singleQuotedKey;
                var key = raw.replace(/\\(.)/g, '$1'); // strips backslashes

                if (!messages.hasOwnProperty(key))
                    messages[key] = gs.getMessage(key) || key;

                return messages[key];
            }
        );
    }
    var gr = new GlideRecord("sys_ux_widget");

    if (gr.get(sys_id)) {
        var result = {};
        var fields = gr.getFields();

        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            result[field.getName()] = gr.getValue(field.getName());
        }

        result['sys_id'] = sys_id;
        var template = j2js(result['template']);
        if (!gs.nil(template)) {
            result['template'] = processTemplateMessages(template);
        }
        var response = {};
        response[sys_id] = result;
        return response;
    }
})();
