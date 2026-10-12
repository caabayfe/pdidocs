function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   
   var namespace = g_form.getValue('namespace');
   if (!namespace)
		g_form.setValue('namespace', getNamespacName(newValue));
   
}

function getNamespacName(namespacedName) {
	var gr = new GlideRecord('dynamic_attribute');
	gr.addQuery('namespaced_name', namespacedName);
	gr.query();
	return gr.next() ? gr.namespace : "";
}
