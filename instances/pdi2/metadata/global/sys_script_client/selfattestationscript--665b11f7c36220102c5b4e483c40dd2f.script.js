function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   var attestationType = g_form.getValue("attestation_type");
   
   if(attestationType == 'direct' || attestationType == 'indirect') {
       g_form.setValue('platform_self_attestation', true);
       g_form.setValue('cross_platform_self_attestation', false);
   } else {
       g_form.setValue('platform_self_attestation', false);
       g_form.setValue('cross_platform_self_attestation', false);
   }
   
}
