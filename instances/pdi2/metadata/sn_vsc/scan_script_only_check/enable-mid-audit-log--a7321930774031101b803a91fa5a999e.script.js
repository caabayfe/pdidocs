(function(finding) {

 // Query to see if any MID Servers are configured 
 var gr1 = new GlideRecord('ecc_agent');
 gr1.query();

 // Check to make sure MID Server functionality is utilized before returning a finding
 if(gr1.next()){
  // Query for MID Server Property mid.log.command_audit.enable
  var gr = new GlideRecord('ecc_agent_property');
  var propQuery = 'name=mid.log.command_audit.enable';
  gr.addEncodedQuery(propQuery);
  gr.query();

  // If the property table record does not exit, then default is false
  var found = gr.next();
  if (!found) {
    finding.increment();
  } else if (gr.getValue('value') != 'true'){
   finding.setCurrentSource(gr);
   finding.increment();
  }
 }
})(finding);
