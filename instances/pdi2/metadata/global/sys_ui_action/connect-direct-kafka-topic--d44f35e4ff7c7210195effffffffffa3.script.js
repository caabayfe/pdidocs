function connectDirectKafkaTopic() {
    var sys_id = g_form.getUniqueValue();
    var gdw = new GlideDialogWindow('connect_topic');
    var gwt = new GwtMessage();
    gdw.setTitle('<strong>' + gwt.getMessage('Connect Direct Kafka Topic') + '<strong>');
    gdw.setSize(350, 300);    
    gdw.setPreference('sysparm_topic_alias_sys_id', sys_id);
    gdw.setPreference('sysparm_underlying_topic_table', "sys_kafka_direct_topic");
    gdw.setPreference('sysparm_underlying_topic_label', gwt.getMessage('Direct Kafka Topic'));
    gdw.render();
}

action.setRedirectURL(current);
