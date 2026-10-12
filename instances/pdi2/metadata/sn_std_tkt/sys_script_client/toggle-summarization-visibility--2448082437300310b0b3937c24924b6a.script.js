function onLoad() {
   //Type appropriate comment here, and begin script below
   var summaryFields = g_form.getValue('summary_fields');

    if (!summaryFields) {
        // summary_fields is empty — hide the summarization section
        g_form.setSectionDisplay('summarization', false);
    } else {
        // summary_fields has data — show the section and make the field read-only
        g_form.setSectionDisplay('summarization', true);
    }
}
