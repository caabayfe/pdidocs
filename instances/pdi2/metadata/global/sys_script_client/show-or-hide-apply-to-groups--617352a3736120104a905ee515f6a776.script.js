function onLoad() {
   //Quick Action should either be accessible to all groups or certain selected groups
   g_form.setMandatory('apply_to_groups', g_form.getValue('apply_to_all_groups') != 'true');
   g_form.setDisplay('apply_to_groups', g_form.getValue('apply_to_all_groups') != 'true');
}
