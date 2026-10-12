// Live Agent Support, Virtual Agent Feedback and Show Notification
    var discoverableTopics = ['b18df45853130010cf8cddeeff7b12fd', 'ce2ee85053130010cf8cddeeff7b12bf', '7c3c819073a3101066c7e9344ef6a7e4'];
var nonDiscoverableTopics = ['a428e4e05b721010a76b04d13d81c705','86cf6a4e5316101055eeddeeff7b12ba'];
var gr = new GlideRecord('sys_cs_topic');
gr.query();
while (gr.next()) {
    var isVisible = !gs.nil(gr.visible) ? gr.visible : false;
    var isActive = !gs.nil(gr.active) ? gr.active : false;
    var isSystemTopic = !gs.nil(gr.is_system_topic) ? gr.is_system_topic : false;
    var isLibrary = !gs.nil(gr.library) ? gr.library : false;
    if((!isSystemTopic && !isLibrary && (isActive || isVisible) && nonDiscoverableTopics.indexOf(gr.getValue('sys_id')) == -1) || discoverableTopics.indexOf(gr.getValue('sys_id')) != -1){
       gr.setValue('discoverable', true);
    } else {
        gr.setValue('discoverable', false);
    }
    gr.update();
}
