function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }
	setLookupAndReplacement();
	updateExampleRewrite();
}
