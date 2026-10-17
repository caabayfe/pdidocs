function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
	if (newValue === 'use_lat_lon'){
		alert(getMessage('Are you sure? Because this field disables drilling on maps that use this map source, select it only on the lowest level of the map source hierarchy. Also ensure that the field you selected contains valid latitude and longitude data.'));
	}
   
}
