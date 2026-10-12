
var gr = new GlideAggregate('sc_cat_item');
gr.addQuery('sys_class_name', 'sc_cat_item');
gr.addActiveQuery();
var qc = gr.addJoinQuery('sc_service_fulfillment_flow_registry', 'flow_designer_flow', 'service_fulfillment_flow');
qc.addCondition('active', 'true');
gr.addAggregate('COUNT');
gr.setWorkflow(false);
gr.query();
answer = gr.getCount();
