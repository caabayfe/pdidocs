changeSLABreachCompatibilityOption();

function changeSLABreachCompatibilityOption() {
   if (current.value == 'false' && SLAProperties.isEngineVersion('2011')) {
	  // can only be turned off, if SLA Engine is 2011
      SLABreachChange.updateBreachedCompatOff();
   }
   else if (current.value == 'true') {
      SLABreachChange.updateBreachedCompatOn();
   }
}
