(function executeRule(current, previous /*null when async*/ ) {

    var eventProcessor = new GlideRecord("sys_event_processor");
    eventProcessor.addQuery("processor", current.sys_id);
	eventProcessor.addQuery("state", "active");
    eventProcessor.query();
    if (eventProcessor.isValidField('processor_type')) {
        if (eventProcessor.next()) {
            if (eventProcessor.getValue("processor_type") === "dedicated") {
                eventProcessor.deleteRecord();
            } else {
                eventProcessor.setValue("state", "inactive");
                eventProcessor.update();
            }
        }
        new SNC.EventProcessorRegister().createOrUpdateProcessor(current);
    }

})(current, previous);
