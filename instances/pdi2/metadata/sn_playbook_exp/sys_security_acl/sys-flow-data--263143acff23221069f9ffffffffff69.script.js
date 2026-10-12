var pdContextGr = new GlideRecord("sys_pd_context");
pdContextGr.get(current.playbook_context);
answer = sn_playbook.PlaybookExperience.canReadActivity(pdContextGr, current.activity_id);
