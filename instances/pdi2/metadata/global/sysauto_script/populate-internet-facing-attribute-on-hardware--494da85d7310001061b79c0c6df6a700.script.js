// Example script to populate 'Internet Facing' field on 'Hardware' table.

// Mark 'Internet Facing' = false only when you are sure about it. Otherwise treat the CI as Internet facing(true) to assume the highest risk

var defaultVal = true;  // In case , IP address is not present or is not valid, then use this value for 'Internet Facing' attribute

populateForNonEmptyIP();
populateForEmptyIP(defaultVal);


// Update 'Internet Facing' attribute to true if corresponding IP address is,-
// 1. non empty and
// 2. is valid IPV4 address (i.e. in the range 0.0.0.0 to 225.225.225.225) and
// 3. is not private IP address.
function populateForNonEmptyIP() {
  var gr = new GlideRecord('cmdb_ci_hardware');
  gr.addEncodedQuery('ip_address!=NULL');
  gr.query();
  while(gr.next()) {
    var ipAddress = gr.getValue('ip_address');
    var ip = SncIPAddressV4.getIPAddressV4FromDDecimal(ipAddress);  // Make sure IP address is valid IPV4 address
    if(JSUtil.notNil(ip)) {
      gr.setValue('internet_facing', new SNC.IPAddressV4(ipAddress).isPublicAddress());
    } else {
      gr.setValue('internet_facing', defaultVal);
    }
    gr.update();
  }
}

// For all Hardware CIs which do NOT have IP address value, populate 'Internet Facing' attribute to internetFacing parameter
function populateForEmptyIP(internetFacing) {
  if(typeof(internetFacing) != 'boolean') {
    gs.error('Expected boolean value for Internet Facing attribute');
    return;
  }
  var gr = new GlideRecord('cmdb_ci_hardware');
  gr.addEncodedQuery('ip_address=NULL');
  gr.query();
  gr.setValue('internet_facing', internetFacing);
  gr.updateMultiple();
}
