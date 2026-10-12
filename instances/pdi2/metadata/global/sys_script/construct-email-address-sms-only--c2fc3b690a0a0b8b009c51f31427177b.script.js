var addressVar = '';

//If this provider doesnt require a custom script
if (!current.service_provider.use_custom_script) {

   //If a construction script is to be used, evaluate it
   if (current.service_provider.use_construction_script == true) {
      addressVar = eval(current.service_provider.construction_script);

   //If not, construct the address with the prefix, the number, and the suffix
   } else if (current.phone_number){

      if (!current.service_provider.email_prefix.nil()) {
         addressVar += current.service_provider.email_prefix;
      }

      addressVar += current.phone_number;

      if (!current.service_provider.email_suffix.nil()) {
         addressVar += '@' + current.service_provider.email_suffix;
      }
   }
   //Set the final address
   current.email_address = addressVar;
}
