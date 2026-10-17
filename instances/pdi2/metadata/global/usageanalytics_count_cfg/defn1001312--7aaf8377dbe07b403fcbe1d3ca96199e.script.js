var count1 = 0;
var count2 = 0;
var result = 0;
var record = new GlideAggregate('ts_query_kb');
record.addEncodedQuery("top_click_rankISNOTEMPTY");
record.addQuery('sys_created_on', '>=', gs.daysAgo(30));
record.addAggregate('COUNT');
record.query();

if (record.next()) {
   count1 = record.getAggregate('COUNT');
}

var record2 = new GlideAggregate('ts_query_kb');
record2.addQuery('sys_created_on', '>=', gs.daysAgo(30));
record2.addAggregate('COUNT');
record2.query();

if (record2.next()) {
   count2 = record2.getAggregate('COUNT');
}
if(count2!=0){
  result = (count1/count2)*100;
}
answer = result;
