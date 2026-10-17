function onSubmit() { 
    var destroy_table = g_form.getValue('table');
    var archive = g_form.getReference('archive');
 
    if (destroy_table != 'ar_' + archive.table)
        g_form.setValue('destroy_related', false);
   
}
