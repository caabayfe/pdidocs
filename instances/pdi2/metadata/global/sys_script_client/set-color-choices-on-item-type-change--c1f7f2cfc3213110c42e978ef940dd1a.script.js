function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   (new ActionLayoutItemColorHelper()).handleActionItemTypeChange(newValue);
}
