var EmMidUtil = Class.create();
EmMidUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

 // Check that a mid server contain EvenManagement application
 missingApplication:function(sysId) {
	 if(GlideStringUtil.notNil(sysId) && typeof sysId !== 'undefined') {
		midServerSysId = sysId; // Call from server
	} else {
	    midServerSysId = this.getParameter('midSysId'); // Call from client
	}
	
	 if(midServerSysId == null || midServerSysId == "") //Should not happen
		return false;
	 
	var appGr = new GlideRecordSecure('ecc_agent_application_m2m');
	appGr.addQuery('application', 'IN', '35aa573fd7802200bdbaee5b5e610375,ed76c5d0d7202200bdbaee5b5e6103d9'); //"ALL" or "EventManagement" app
	appGr.addQuery('agent', midServerSysId);
	appGr.query();
	if(appGr.next())
		return false;
	return true;
  },
										
	
    type: 'EmMidUtil'
});
