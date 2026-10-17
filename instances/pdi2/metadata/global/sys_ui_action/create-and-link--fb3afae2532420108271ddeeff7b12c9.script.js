var evamSysID = action.getGlideURI().get('sysparm_collectionID');

action.setRedirectURL('sys_ux_composite_datasource.do?evam=' + evamSysID);

var evamGR = new GlideRecord("sys_ux_composite_data");
evamGR.get(evamSysID);
action.setReturnURL(evamGR);
