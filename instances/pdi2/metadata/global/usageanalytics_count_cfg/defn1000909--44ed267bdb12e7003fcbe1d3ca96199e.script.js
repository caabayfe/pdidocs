var gr=new GlideAggregate('ts_query_kb');
gr.addAggregate('COUNT');
gr.query();
var total_records_count = 0;
var highest_click_count = 0;
var result=0;
if(gr.next())
{
  total_records_count = gr.getAggregate('COUNT');
}
var gr2=new GlideAggregate('ts_query_kb');
gr2.addNotNullQuery('top_click_rank');
gr2.addAggregate('COUNT');
gr2.query();
if(gr2.next())
{
  highest_click_count = gr2.getAggregate('COUNT');
}
if(total_records_count!=0)
{
  result=highest_click_count/total_records_count;
}
answer=result;
