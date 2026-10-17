if (current != null) {
  var street = new String(current.street);
  street = street.replaceAll("\r","");
  street = street.replaceAll("\n"," ");
  var address = encodeParm(street) + " " + encodeParm(current.city) + " " + encodeParm(current.state) + " " + 
  encodeParm(current.zip) + " " + encodeParm(current.country);
  address = address.trim();
	
  if (address.length > 0) {
      var point=GoogleMapsHelper.google_queueRequest(address, current);
    }
}

// encodes non-Latin characters
function encodeParm(parm) {
   return GlideStringUtil.urlEncode(parm);
}
