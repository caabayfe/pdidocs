(function executeRule(current, previous /*null when async*/ ) {
    // Invalidating the callback URL validation property as glide.servlet.uri changed
    gs.setProperty("glide.ml.callback_url.validation.status", "false");
})(current, previous);
