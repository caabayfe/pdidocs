(function executeRule(current, previous /*null when async*/ ) {
    if (shouldSkipExecution(current))
        return;

    GlideappProcessPriceUpdater.updateProcessPrice(current);

    function shouldSkipExecution(current) {
        return shouldSkipByProcess(current) || !(new global.SNCCatalogUtil().hasPricingImplicationsImpact(current));
    }

    function shouldSkipByProcess(current) {
        return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout']);
    }
})(current, previous);
