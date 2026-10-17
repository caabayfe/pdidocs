// The following variables are available: 
 // - primary: contains the sys_id of the assessable object to be evaluated 
 // - actual_result: the script sets the actual value for this metric to this variable 
 // - scaled_result: the script sets the scaled value (used in calculations) for this metric to this variable 
 // 
 // For example:
 // var gr = new GlideRecord('cmdb_ci');
 // gr.addQuery('manufacturer', primary);
 // gr.query();
 // actual_result = gr.getRowCount();
 // if (actual_result &gt; 100) scaled_result = 5;
 // else scaled_result = 1;
