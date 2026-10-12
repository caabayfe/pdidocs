var parent = current.parent;
var hasCalculator = false;
while(parent){
     var result = new GlideRecord('cmn_timeline_sub_item');
     result.addQuery('sys_id', parent);
     result.query();
     if (!result.next()){
         result = new GlideRecord('cmn_timeline_page');
         result.addQuery('sys_id', parent);
         result.query();
         if (result.next())
             hasCalculator = (result.range_calculator && result.range_calculator != "");
         parent = null;
     }else
         parent = result.parent;
}
answer = !hasCalculator;
