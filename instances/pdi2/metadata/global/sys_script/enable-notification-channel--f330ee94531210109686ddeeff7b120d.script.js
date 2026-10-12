(function executeRule(current, previous /*null when async*/ ) {

    var mapping_gr = new GlideRecord('sys_cs_notification_channel_configuration');
    mapping_gr.addQuery('channel', current.getUniqueValue());
    mapping_gr.query();

    while (mapping_gr.next()) {
        var gr = new GlideRecord('sys_notification_channel');
        gr.get(mapping_gr.getValue('notification_channel'));
        gr.setValue('active', current.getValue('enable_notification'));
        gr.update();
    }

})(current, previous);
