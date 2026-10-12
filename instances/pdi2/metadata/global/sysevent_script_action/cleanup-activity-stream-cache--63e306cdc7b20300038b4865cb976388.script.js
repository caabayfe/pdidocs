// react to logout and cleanup any Activity Stream Cache data that may be left over
var isCacheEnabled = gs.getProperty("com.snc.actsub.activity.stream.cache.enable") == "true";

if (isCacheEnabled)
    cleanupActivityStreamCache(event.parm1);

function cleanupActivityStreamCache(userId) {
    if (!userId)
        return;
    var gr = new GlideRecord("sys_user");
    gr.addQuery("user_name", userId);
    gr.query();
    if (gr.next()) {
        var cacheMgr = new ActivityStreamCacheManager();
        cacheMgr.flushStreams([gr.sys_id + ""]);
    }
}
