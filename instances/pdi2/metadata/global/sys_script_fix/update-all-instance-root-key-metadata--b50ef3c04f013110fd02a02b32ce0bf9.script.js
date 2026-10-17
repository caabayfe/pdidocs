(function() {
    var JOB = 'b66df7804f013110fd02a02b32ce0bcc';
    var gr = new GlideRecord('sysauto_script');
    if (!gr.get(JOB)) {
        gs.error("Update all Instance Root Key metadata :: Could not find scheduled job with sys_id: " + JOB);
        return;
    }
    SncTriggerSynchronizer.executeNow(gr);
})();
