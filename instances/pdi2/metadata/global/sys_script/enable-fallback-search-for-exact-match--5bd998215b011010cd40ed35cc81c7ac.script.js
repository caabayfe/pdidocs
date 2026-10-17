(function executeRule(current, previous /*null when async*/ ) {
    var newPrefix = current.getValue("prefix");
    var oldPrefix = previous.getValue("prefix");
    var lookupTable = previous.getValue("category");

    if (oldPrefix != newPrefix) {
        new EnableFallbackSearch().enable(lookupTable);
    }
})(current, previous);
