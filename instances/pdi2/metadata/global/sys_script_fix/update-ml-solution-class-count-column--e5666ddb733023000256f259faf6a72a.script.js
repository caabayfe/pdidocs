var gr_ml_solution = new GlideRecord('ml_solution');
gr_ml_solution.query();

while(gr_ml_solution.next()){
   var gr_ml_class = new GlideRecord('ml_class');
   gr_ml_class.addQuery('solution',gr_ml_solution.sys_id);
   gr_ml_class.query();
   var ml_class_count = gr_ml_class.getRowCount();
   gr_ml_solution.class_count = ml_class_count;
   gr_ml_solution.update();
}
