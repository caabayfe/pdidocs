(function executeRule(current, previous /*null when async*/ ) {
    var grScript = new GlideRecord("sysauto_script");
    if (grScript.get("63fcb052731320106dfdbd49faf6a7d4")) //Fallback Timeout for interactions in Wrap Up
    {
        var originId = current.origin_id.toString();
        var gr = new GlideRecord("interaction");
        if (gr.get(originId)) {
            if (gr.active) {
                gr.state = (grScript.active) ? 'wrap_up' : 'closed_complete';
                gr.update();
            }
        }
    }

})(current, previous);
