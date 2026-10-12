var collectionID = RP.getParameterValue("sysparm_collectionID");
var wf_ver = new GlideRecord("wf_workflow_version");
wf_ver.get(collectionID);
var table = new GlideRecord("var_dictionary");
table.get(collectionID);
action.setRedirectURL("var_dictionary.do?sysparm_view=diagrammer&sys_id=-1&sysparm_query=model_table=wf_workflow^model_id=" + wf_ver.getValue("workflow"));
action.setReturnURL(wf_ver)
