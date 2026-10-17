
function updateLiveAgentOnlyFlag(value) {
    var gr = new GlideRecord("sys_cs_channel");
    gr.addQuery("sys_id", "!=", "ea0cb816732110104a905ee515f6a7b5");
    gr.addEncodedQuery("synchronousISEMPTY^ORsynchronous=false");
    gr.query();
    while (gr.next()) {
        gr.setWorkflow(false);
        gr.setValue("live_agent_only", value);
        gr.update();
    }
}

function updateLiveAgentOnlySysProperty(value) {
    var gr = new GlideRecord('sys_properties');
    gr.addActiveQuery();
    gr.addQuery('name', 'com.glide.cs.cccif.live_agent_only');
    gr.query();
    if (gr.next()) {
        gr.value = value;
        gr.setWorkflow(false);
        gr.update();
    }
}
/*
If system property "com.glide.cs.cccif.live_agent_only" is true update all now Webclient channels to Live Agent only flag true. 
And update system property "com.glide.cs.cccif.live_agent_only" to false as it is no more needed.
*/

var liveAgentOnly = gs.getProperty("com.glide.cs.cccif.live_agent_only");
gs.info(" Live agent only system property value : " + liveAgentOnly);
if (liveAgentOnly && liveAgentOnly == "true") {
    gs.info(" Update Live agent flag CS Channels : " + liveAgentOnly);
    updateLiveAgentOnlyFlag(true);
    updateLiveAgentOnlySysProperty(false);
}
