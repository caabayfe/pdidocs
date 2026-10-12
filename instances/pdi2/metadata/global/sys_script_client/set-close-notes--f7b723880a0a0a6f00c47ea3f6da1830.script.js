var DUPLICATE_MSG = 'Submission was deemed to be a duplicate';
var INVALID_MSG = 'Submission was deemed to be inaccurate or unnecessary';

function onChange(control, oldValue, newValue, isLoading) {
    var display = newValue.indexOf('closed') == 0;
    g_form.setDisplay('close_notes', display);

    var canOverWrite = false;

    if (g_form.getValue('close_notes') == '')
        canOverWrite = true;
    
    if (g_form.getValue('close_notes') == DUPLICATE_MSG || g_form.getValue('close_notes') == INVALID_MSG)
        canOverWrite = true;	

    if (!canOverWrite)
        return;


    if (newValue == 'closed_duplicate') {
       g_form.setValue('close_notes', DUPLICATE_MSG);
    } else if (newValue == 'closed_invalid') {
       g_form.setValue('close_notes', INVALID_MSG);
    }
    
}
