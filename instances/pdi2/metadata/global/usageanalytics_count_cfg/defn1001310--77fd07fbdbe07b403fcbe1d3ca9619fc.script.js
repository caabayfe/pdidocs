var record = new GlideAggregate('ts_query_kb');
record.addAggregate('AVG', 'top_click_rank');
record.addQuery('sys_created_on', '>=', gs.daysAgo(30));
record.setGroup(false);
record.query();
var result=0;
if (record.next()) {
   result = record.getAggregate('AVG', 'top_click_rank') || 0;
}
answer = result;
