function onLoad() {
    var event = g_form.getReference('event', setSourceTable);

    function setSourceTable(event) {
        g_form.setValue('event_source_table', event.source_table);
    }    
}
