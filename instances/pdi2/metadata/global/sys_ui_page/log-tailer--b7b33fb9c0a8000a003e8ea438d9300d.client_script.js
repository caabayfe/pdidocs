function startTail() {
   tailLog(0);
}

function tailLog(lastSeq) {
    var aj = new GlideAjax("ChannelAjax");
    aj.addParam("sysparm_name", "#logtail");
    aj.addParam("sysparm_value", lastSeq);
    aj.addParam("sysparm_silent_request", "true");
    aj.getXML(gotLogMessages);
}

function gotLogMessages(response) {
    if (haveError(response))
        return;

    var lastSeq = response.responseXML.documentElement.getAttribute("channel_last_sequence");
    var items = response.responseXML.getElementsByTagName("item");
    jslog("response=" + response.responseText);

    for(var i = 0; i < items.length; i++) {
        var item = items[i];
        var el = cel('div');
        el.style.whiteSpace = "pre";

        var msg = item.getAttribute('message');
        var date = item.getAttribute('date');

        el.innerHTML = date + " " + msg;
        document.body.appendChild(el);
        document.body.scrollTop = document.body.scrollHeight;
    }

    tailLog(lastSeq);
}

function haveError(response) {
    if (!response) {
        alert("invalid response!");
        return true;
    }

    var error = response.responseXML.documentElement.getAttribute("error");
    if (error) {
        alert("ERROR: " + error);
        return true;
    }

    return false;
}

// if we're unloading the page, lets force a request that will
// log so it breaks our AJAX request and allows us to nav away
function forceLogEntry() {
    serverRequest('stats.do');
}

addLoadEvent(startTail);
Event.observe(window, 'beforeunload', forceLogEntry, false);
