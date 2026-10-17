var gr = new GlideRecord('ecc_agent_issue');
gr.addQuery('source', 'loggedInUserIsNotUnique');
gr.query();
gr.deleteMultiple();
