var gr = new GlideAggregate('kb_feedback_task');
gr.addQuery('sys_created_on', '>=', gs.daysAgo(30));
gr.addAggregate('COUNT');
gr.query();
var result=0;
var feedback_task_count = 0;
if(gr.next()) 
   feedback_task_count = gr.getAggregate('COUNT');


var gr2 = new GlideAggregate('kb_feedback_task');
gr2.addQuery('closed_at', '>=', gs.daysAgo(30));
gr2.addAggregate('COUNT');
gr2.query();
var feedback_task_closed_count = 0;
if(gr2.next()) 
   feedback_task_closed_count = gr2.getAggregate('COUNT');

if(feedback_task_count!=0)
{
  result=(feedback_task_closed_count/feedback_task_count)*100;
}
answer=result;
