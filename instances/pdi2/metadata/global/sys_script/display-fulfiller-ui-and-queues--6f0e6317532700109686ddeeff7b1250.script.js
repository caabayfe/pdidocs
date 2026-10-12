(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.disableQueues = false;
    if (!GlidePluginManager.isActive('com.glide.connect.support') || isChatQueueListEmpty()) {
        g_scratchpad.disableQueues = true;
    }

    function isChatQueueListEmpty() {
        if (gs.tableExists('chat_queue')) {
            var gr = new GlideRecord('chat_queue');
            gr.query();
            return !gr.hasNext();
        }
        return true;
    }

})(current, previous);
