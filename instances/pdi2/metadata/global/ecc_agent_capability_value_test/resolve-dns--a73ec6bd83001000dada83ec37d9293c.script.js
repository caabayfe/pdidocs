function(capability_value, requested_value) {
   if (JSUtil.nil(capability_value))
      return true;

   var i = requested_value.lastIndexOf(capability_value);
   if (i < 0)
      return false;

   if (i == 0)
      return true;

   if (requested_value.length != i + capability_value.length)
      return false;

   return (requested_value.charAt(i - 1) == '.') && (i > 1);
}
