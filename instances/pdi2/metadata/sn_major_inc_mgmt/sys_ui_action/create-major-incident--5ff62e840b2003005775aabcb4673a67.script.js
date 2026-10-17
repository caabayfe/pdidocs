var mim = new sn_major_inc_mgmt.MajorIncidentTriggerRules(current);
var parentGr = mim.createParentIncidentFromMIC();
action.setRedirectURL(parentGr);
