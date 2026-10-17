(function() {
    data.requestHeader = gs.getMessage(options.header_title);
    var widgetLimitOptions = {};
    widgetLimitOptions.limit = options.limit;
    data.widget = $sp.getWidget('ec-requests-tabs', widgetLimitOptions);
})();
