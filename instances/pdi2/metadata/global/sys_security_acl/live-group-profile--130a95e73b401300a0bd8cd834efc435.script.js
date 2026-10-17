var gr = new GlideRecord('live_group_member');
gr.addQuery('member', GlideappLiveProfile().getID());
gr.addQuery('group', current.sys_id);
gr.addQuery('state', 'admin').addOrCondition('state', 'active');
gr.query();
answer = gr.next() || gs.hasRole("awa_manager");
