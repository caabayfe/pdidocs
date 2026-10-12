function actionOK() {
    var underlyingTopic_sysId = gel('sysparm_underlying_topic_sys_id')?.value || '';
    var topicAlias_sysId = gel('sysparm_topic_alias_sys_id')?.value || '';
    var topicTableName = gel('sysparm_underlying_topic_table')?.value || '';

    if (!underlyingTopic_sysId || !topicAlias_sysId || !topicTableName) {
        notificationMessage("Please select a topic and try again.");
        return;
    }
    
    var ga = new GlideAjax('StreamConnectTopicAliasLinker');
    ga.addParam('sysparm_underlying_topic_sys_id', underlyingTopic_sysId);
    ga.addParam('sysparm_topic_alias_sys_id', topicAlias_sysId);
    if (topicTableName == 'sys_kafka_topic') {
        ga.addParam('sysparm_name', 'linkHermesTopic');
    } else {
        ga.addParam('sysparm_name', 'linkDirectKafkaTopic');
    }
    ga.getXML();

    GlideDialogWindow.get().destroy();
    reloadWindow(window);

}


function notificationMessage(msg) {
    var options = {};
    options.text = "<b style='color:red;'>" + msg + "</b>";
    options.fadeIn = 0;
    options.fadeOut = 500;
    options.closeDelay = 5000;
    options.sticky = false;
    options.type = "warn";


    new NotificationMessage(options);
}
