function onChange(control, oldValue, newValue) { 
   g_form.setVisible('field', newValue.indexOf('Change') != -1 || newValue.indexOf('CellEdit') != -1);
}
 
