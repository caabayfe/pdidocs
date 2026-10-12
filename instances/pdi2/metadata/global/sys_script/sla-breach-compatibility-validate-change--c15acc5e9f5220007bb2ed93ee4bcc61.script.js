changeSLABreachCompatibilityOption();

function changeSLABreachCompatibilityOption() {
   if (current.value == 'false' && !SLAProperties.isEngineVersion('2011'))
	  // can only be turned off, if SLA Engine is 2011
      current.value = previous.value;
}
