var eventProcessor = new GlideRecord("sys_event_processor");
if (eventProcessor.isValidField('processor_type')) {
    eventProcessor.addQuery("processor", current.sys_id);
	eventProcessor.addQuery("state", "active");
    eventProcessor.query();
    if (eventProcessor.next()) {
        if (eventProcessor.getValue("processor_type") === "dedicated")
            eventProcessor.deleteRecord();
        else {
            eventProcessor.setValue("state", "inactive");
            eventProcessor.update();
        }
    }
}
