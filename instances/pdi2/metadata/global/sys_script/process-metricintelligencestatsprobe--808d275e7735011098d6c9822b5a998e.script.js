(function executeRule(current, previous) {
    var now = new GlideDateTime();
    current.setValue("state", "processed");
    current.setValue("processed", now);
    var responseToGr = current.getElement("response_to").getRefRecord();
    if (responseToGr.getValue("state") != "processed") {
        responseToGr.setValue("state", "processed");
        responseToGr.setValue("processed", now);
        responseToGr.update();
    }
})(current, previous);
