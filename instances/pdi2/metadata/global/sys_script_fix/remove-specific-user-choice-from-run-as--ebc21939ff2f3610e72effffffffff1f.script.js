var gr= new GlideRecord("sys_choice");

gr.addQuery('value=selected_user^name=sys_pd_activity_definition^ORname=sys_pd_derivative^element=ai_agent_run_as');
gr.query();

gr.deleteMultiple();
