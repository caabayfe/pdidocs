function onBefore(current, previous) {
   if (!current.managing_indicator) {
	   current.managed_breakdown = '';
	   current.managed_element = '';
   }
}
