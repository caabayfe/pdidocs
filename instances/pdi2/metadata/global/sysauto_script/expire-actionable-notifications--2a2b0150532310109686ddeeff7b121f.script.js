var idle_timeout =  new GlideBoundedIntProperty("com.glide.cs.idle_actionable_notification_timer",8, 1, 72);


var gr = new GlideRecord("sys_cs_notification");
gr.addQuery("actionable_notification", true);
gr.addQuery("state", "IN", ["pending", "sent"]);
gr.addQuery('sys_updated_on', '<=' , gs.hoursAgo(idle_timeout));
gr.query();

gr.setValue("state", "expired");
gr.updateMultiple();
