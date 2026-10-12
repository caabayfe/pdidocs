function onLoad() {
   // If this is not a Template Item or a Record Producer, hide the Template field
   if (g_form.getValue('type') != 'template' && gel('sc_cat_item_producer.do') == null && gel('std_change_record_producer.do') == null)
      g_form.setVisible('template', false);

   // Always hide the Type field
   g_form.setVisible('type', false);
}
