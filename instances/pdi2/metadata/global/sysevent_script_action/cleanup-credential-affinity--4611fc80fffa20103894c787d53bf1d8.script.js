var gr = new GlideRecord('dscy_credentials_affinity');
gr.query(event.parm1, event.parm2);
gr.deleteMultiple();
