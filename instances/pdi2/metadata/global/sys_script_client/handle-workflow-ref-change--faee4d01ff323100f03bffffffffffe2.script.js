function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

	control.value = fixup(newValue);
	
	function fixup(newValue) {
		var version = new GlideRecord("wf_workflow_version");
		if (version.get(newValue+''))
			return version.workflow+'';
		
		return newValue;
	}   
}
