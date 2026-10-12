var dashboard = current.getValue('dashboard');
var tab = current.getValue('dashboard_tab');
var table,sysId;

if (dashboard) {
   table = 'par_dashboard';
   sysId = dashboard;
} else if (tab) {
   table = 'par_dashboard_tab';
   sysId = tab;
}
if (table && sysId) {
   var gr = new GlideRecord(table);
   gr.get(sysId);
   answer = gr.isValid() && gr.canRead(); 
} else
	answer = false;
	
