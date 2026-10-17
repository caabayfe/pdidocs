function onSubmit() {
    var action = g_form.getActionName();
    if (action != 'delete_queue_complete')
        return;

    if (!g_form.getBooleanValue('automatic_processing'))
        return confirm(getMessage('Do you want to delete?'));

    var name = prompt(getMessage('Deleting Queue will delete the events in the Queue'), getMessage('Type the word "delete" here'));
    if (!name)
        return false;
    if (name.toLowerCase() != getMessage('delete').toLowerCase())
        return false;
}
