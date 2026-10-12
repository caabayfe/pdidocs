function onLoad() {
    var queueName = decodeURIComponent(getParameterValue('sysparm_queue'));
    var suffix = decodeURIComponent(getParameterValue('sysparm_suffix'));

    if (queueName && queueName !== "undefined")
        g_form.setValue('queue', queueName);
    if (suffix && suffix !== "undefined")
        g_form.setValue('suffix', suffix);
}

function getParameterValue(name) {
    var url = top.location.href;
    var value = new URLSearchParams(url).get(name);
    if (value) {
        return value;
    }
    if (!value) {
        var gUrl = new GlideURL();
        gUrl.setFromCurrent();
        value = gUrl.getParam(name);
        return value;
    }
}
