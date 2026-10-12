function actionOK() {

    var topicAlias_sysId = gel('sysparm_topic_alias_sys_id').value;
    var underlyingTopicTable = gel('sysparm_underlying_topic_table').value;
    var ga = new GlideAjax('StreamConnectTopicAliasLinker');
    ga.addParam('sysparm_topic_alias_sys_id', topicAlias_sysId);
    if (underlyingTopicTable == 'sys_kafka_topic') {
        ga.addParam('sysparm_name', 'unlinkHermesTopic');
    } else {
        ga.addParam('sysparm_name', 'unlinkDirectKafkaTopic');
    }
        
    ga.getXML();
    GlideDialogWindow.get().destroy();
    reloadWindow(window);
}
