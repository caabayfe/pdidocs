var gr = new GlideRecord('par_dashboard_canvas');
gr.get(current.getValue('canvas'));
answer = gr.isValid() && gr.canWrite(); 
