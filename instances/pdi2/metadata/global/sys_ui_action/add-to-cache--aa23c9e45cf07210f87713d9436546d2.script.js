var gr = new GlideRecord('qc_configured_query');
gr.query_string = current.query_string;
gr.insert();
action.setRedirectURL('qc_configured_query_list.do');
