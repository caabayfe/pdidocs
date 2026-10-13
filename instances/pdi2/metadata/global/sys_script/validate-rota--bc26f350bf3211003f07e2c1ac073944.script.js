var spans = new GlideRecord("cmn_schedule_span");
spans.addQuery("schedule", current.schedule);
spans.query();
while(spans.next()) {
	if (!RotaScheduleEntryValidation.isValid(spans))
    	current.setAbortAction(true);
}
