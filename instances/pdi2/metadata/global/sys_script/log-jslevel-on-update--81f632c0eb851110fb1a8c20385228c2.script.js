(function executeRule(current, previous /*null when async*/ ) {
    if (current.js_level == 'es_latest')
        gs.info("es_latest turned on for app: " + current.scope + ", switched from: " + previous.js_level);
    else if (previous.js_level == 'es_latest')
        gs.info("es_latest turned off for app: " + current.scope + ", switched to: " + current.js_level);
})(current, previous);
