if (!current.center_address.nil()) {
   var point=GoogleMapsHelper.google_getLatLong(current.center_address + '');
   if (point[0] && point[1]) {
      current.center_latitude = point[0];
      current.center_longitude = point[1];
   }
}
