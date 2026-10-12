function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading)
      return;

   g_form.setValue("m2m_to_field", newValue);
   g_form.setValue("m2m_from_label", newValue);
   updateFromLabelIfTranslationExists(newValue);
   calcM2MName();
}

function updateFromLabelIfTranslationExists(value) {
   var gr = new GlideRecord('sys_documentation');
   gr.addQuery('name', value);
   gr.addQuery('element', null);
   gr.addQuery('language', new GwtMessage().getLanguage());
   gr.query();
   if (gr.next())
      g_form.setValue("m2m_from_label", gr.plural);
}
