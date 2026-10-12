var gr = new GlideRecord('quickactions_action');
if (gr.get('234bd259b7ae00108766db98ee11a92a') && !gr.active) {
    new AWALoggingUtils().atInfo().log('Activating the help quick action');
    gr.setValue('active', true);
    gr.update();
}
