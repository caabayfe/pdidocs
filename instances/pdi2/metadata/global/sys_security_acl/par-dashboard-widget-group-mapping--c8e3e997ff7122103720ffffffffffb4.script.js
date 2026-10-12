var gr = new GlideRecord('par_dashboard_widget');
gr.get(current.getValue('widget'));

var gr_wg = new GlideRecord('par_dashboard_widget_group');
gr_wg.get(current.getValue('group'));

answer = gr.canCreate() && gr_wg.canCreate(); 
