function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }

   g_form.showFieldMsg('roster_position', getMessage('1 = Primary, 2 = Secondary, 3 = Tertiary'), 'info');
}
