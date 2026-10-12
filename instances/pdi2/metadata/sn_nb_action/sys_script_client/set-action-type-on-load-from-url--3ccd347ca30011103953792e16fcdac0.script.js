function isPayloadSafe(payload) {
    var regex = /^[a-zA-Z0-9]{32}$/i;
    return regex.test(payload);
}

function onLoad() {
    if (g_form.isNewRecord()) {
        var gUrl = new GlideURL();
        gUrl.setFromCurrent();
        var value = gUrl.getParam("sysparm_action_type");
        if (value) {
            g_form.setValue('action_type', value);
        } else {
            var tinyId = gUrl.getParam("sysparm_tiny");
            if (tinyId && isPayloadSafe(tinyId)) {
                var client = new XMLHttpRequest();
                var tinyApiUrl = "/api/now/tinyurl/" + tinyId;
                client.open("get", tinyApiUrl);
                client.setRequestHeader('Accept', 'application/json');
                client.setRequestHeader('Content-Type', 'application/json');
                client.setRequestHeader("X-UserToken", g_ck);
                client.onreadystatechange = function() {
                    if (this.readyState == this.DONE) {
                        value = JSON.parse(this.response).result.sysparm_action_type;
                        if (value) {
                            g_form.setValue('action_type', value);
                        }
                    }
                };
                client.send("");
            }
        }
    }
}
