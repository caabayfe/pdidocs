(function buildJSON( /*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
    var deepLinkGenerator = new global.MobileDeepLinkGenerator("Request");
    var link = deepLinkGenerator.getUniversalLink("/mesp?id=me_take_assessment&instance_id=" + current.sys_id);
    var json = {
        "Link": link
    };
    return json;
})(current, message, attributes);
