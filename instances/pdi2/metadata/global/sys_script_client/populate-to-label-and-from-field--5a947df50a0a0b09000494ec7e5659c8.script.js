function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading)
      return;

   g_form.setValue("m2m_from_field", newValue);
   g_form.setValue("m2m_to_label", newValue);
   updateToLabelIfTranslationExists(newValue);
   calcM2MName();
}

function updateToLabelIfTranslationExists(value) {
   var gr = new GlideRecord('sys_documentation');
   gr.addQuery('name', value);
   gr.addQuery('element', null);
   gr.addQuery('language', new GwtMessage().getLanguage());
   gr.query();
   if (gr.next())
      g_form.setValue("m2m_to_label", gr.plural);
}
