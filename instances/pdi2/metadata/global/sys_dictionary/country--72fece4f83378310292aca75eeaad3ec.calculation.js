   (function calculatedFieldValue(current) {
   if (current.phone_number != null) {
    var to = new GlideElementPhoneNumber();
    if (to.setPhoneNumber(current.phone_number, false))
     return to.getTerritory();
}})(current);
