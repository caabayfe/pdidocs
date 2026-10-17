// Capture the initial message wrapper posted to the iframe on render
var iframeModalMessage;
window.addEventListener("message", function(e) {
    iframeModalMessage = e;
});

function actionOK() {
    if ("$[JS,HTML:jvar_template]") {
        applyDefaultsAjaxCall("$[JS,HTML:jvar_template]" + '');
    }
}

function cancel() {
	closeModal();
}

function applyDefaultsAjaxCall(queryString) {
    var ga = new GlideAjax('KnowledgeTypeDefaultsAjax');
    ga.addParam('sysparm_name', 'getValues');
    ga.addParam('sysparm_query_string', queryString);
    ga.addParam('sysparm_source', 'workspace');
    ga.getXML(renderResponse);
}

function renderResponse(response) {
    if (!response || !response.responseXML || !response.responseXML.getElementsByTagName("item"))
        return;
    var defaultValuesMap = parseResponseXML(response.responseXML.getElementsByTagName("item"));
    // Post message to the source reference provided. Send modal details back with status
    iframeModalMessage.source.postMessage({
        messageType: iframeModalMessage.data.messageType,
        modalAction: "IFRAME_MODAL_ACTION_POST_TO_SOURCE",
        modalId: iframeModalMessage.data.modalId,
        origOrgin: iframeModalMessage.origin,
        src: iframeModalMessage.data.src,
        dialogAction: "MODAL_KB_DEFAULT_APPLY_CONFIRM",
        response: defaultValuesMap
    });
	closeModal();
}

function parseResponseXML(items) {
    var defaultValuesMap = {};
    for (var i = 0; i < items.length; i++) {
        defaultValuesMap[items[i].getAttribute("name")] = items[i].getAttribute("value");
    }
    return defaultValuesMap;
}

function closeModal() {
	window.location.href = window.location.href + '&sysparm_next_pg=true';
}
