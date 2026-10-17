//
// Get a filter for baseline
//
function getBaseFilter(baseline) {
   var answer = null;
   if (baseline != null && baseline != '') {
       var base = new GlideRecord('cmdb_baseline');
       base.addQuery('name', baseline);
       base.query();
       if (base.next())
          answer = base.sys_created_on;
   }
   if (answer == null) {
       var base = new GlideRecord('cmdb_baseline');
       base.orderByDesc('sys_created_on');
       base.query();
       if (base.next())
          answer = base.sys_created_on;
   }
   return answer;
}
