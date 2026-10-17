function(scope, elem) {
    var lazyLoader = $injector.get("lazyLoader");
    lazyLoader.putTemplates(scope.data.resultTemplates);

    elem.on('NLQ_SP_NAVIGATION', ".triggerActions", function(result) {
        var resultPayload = result.detail.payload;
        window.open(resultPayload.url, "_self");
    });
}
