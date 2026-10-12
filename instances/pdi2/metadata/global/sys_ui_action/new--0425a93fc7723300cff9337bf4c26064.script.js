var gr = new GlideRecord("sysrule_view_workspace");
gr.get(RP.getParameterValue("sysparm_collectionID"));
action.setRedirectURL("sys_aw_form_default_section.do?sysparm_query_override=view_rule=" + gr.getUniqueValue());
action.setReturnURL(gr);
