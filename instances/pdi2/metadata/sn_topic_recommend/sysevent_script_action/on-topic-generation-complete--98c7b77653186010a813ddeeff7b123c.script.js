var generationId = event.parm1;

var gr = new GlideRecord('sn_topic_recommend_view_status');
gr.setValue('report_id', generationId);
gr.setValue('report_type', 'generation');
gr.insert();
