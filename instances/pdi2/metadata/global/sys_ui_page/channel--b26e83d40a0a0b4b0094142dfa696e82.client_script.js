function setupStream(iframe) {
    var cs = new ChannelClient(iframe);
    cs.stream();
}

addLoadEvent(function() {
    // remove timer watch at bottom
    new CookieJar().put('g_startTime', 0);
    NOW.batch_glide_ajax_requests = false;
});
