var noWorkflow = current.getAttribute("no_updatesync_docs");
// If this is a delete, delete any related entries
if (current.operation() == 'delete') {
   var gr = new GlideRecord('sys_documentation');
   gr.addQuery('name', current.name);
   gr.addQuery('element', current.element);
   if (noWorkflow == 'true')
       gr.setWorkflow(false);
   gr.query();
   while (gr.next()) {
      gr.deleteRecord();
   }
} else {
   // Either insert or update the sys_documentation entry in the default language
   var lang = gs.getProperty("glide.sys.language", "en");
   var gr = new GlideRecord('sys_documentation');
   gr.addQuery("language", lang);
   gr.addQuery("name", current.name);
   gr.addQuery("element", current.element);
   if (noWorkflow == 'true')
       gr.setWorkflow(false);
   gr.query();
   if (gr.next()) {
      gr.label = current.label;
      gr.plural = current.label;
      gr.help = current.help;
      gr.hint = current.hint;
      gr.update();
   } else {
      gr.initialize();
      gr.sys_scope = current.sys_scope;
      gr.name = current.name;
      gr.element = current.element;
      gr.language = current.language;
      gr.label = current.label;
      gr.plural = current.label;
      gr.help = current.help;
      gr.hint = current.hint;
      gr.insert();
   }
}
