(function() {
    // for diagnostic modal view
    if (!options.widget_id)
        data.details = input;
    else { // when used as widget at page level
        var arr = options.widget_id.split(",");
        data.details = (new SPDiagnosticsDriver()).categorizeInstances(arr)[options.widget_id];
    }
})();
