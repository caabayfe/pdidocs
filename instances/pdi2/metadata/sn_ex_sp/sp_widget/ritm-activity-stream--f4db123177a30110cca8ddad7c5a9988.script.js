(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    data.stdTicketConversationWidget = '';
    if (options && !gs.nil(options.req_sys_id)) {
        var ritmTable = 'sc_req_item';
        var itemGr = new GlideRecord(ritmTable);
        itemGr.addQuery('request', options.req_sys_id);
        itemGr.query();
        while (itemGr.next()) {
            if (itemGr.canRead()) {
                var widgetParam = {
                    'table': ritmTable,
                    'sys_id': itemGr.sys_id + '',
                    btnLabel: gs.getMessage('Post'),
                    'read_only': false,
                    'rich_text_editor': true,
                    'at_mentions': true
                };
                data.stdTicketConversationWidget = $sp.getWidget('std_ticket_conversations', widgetParam);
            }
        }
    }

})();
