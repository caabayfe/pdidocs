var evamSysID = action.getGlideURI().get('sysparm_collectionID');

action.setRedirectURL('sys_ux_composite_data_m2m_datasource.do?sys_id=-1&sysparm_query=dataset=' + evamSysID);

var evamGR = new GlideRecord("sys_ux_composite_data");
evamGR.get(evamSysID);
action.setReturnURL(evamGR);
