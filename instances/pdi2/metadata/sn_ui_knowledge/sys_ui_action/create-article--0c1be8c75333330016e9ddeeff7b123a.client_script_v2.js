function onClick(g_form) {
    getMessages(["Create Article", "Cancel"], function(messages) {
        g_modal.sn_ui_knowledge.createArticle({
            title: messages["Create Article"],
            confirmTitle: messages["Create Article"],
            cancelTitle: messages["Cancel"],
            size: 'md',
            params: {
                current: g_form.getUniqueValue(),
                source: 'kb_feedback_task',
                modal: 'false'
            }
        }).then(function(result) {
            var query = result.data.query;
            var table = result.data.table;
            if (result.buttonStyle == 'confirm')
                g_aw.openRecord(table, '-1', {
                    'query': query
                });
        }, function(error) {});
    });
}
