var views=new GlideAggregate('kb_use');
views.addQuery('viewed', 'true');
views.addQuery('sys_created_on', '>=', gs.daysAgo(30));
views.addAggregate('COUNT');
views.query();
var feedback_count = 0;
var view_count = 0;
var result=0;
if(views.next())
{
view_count = views.getAggregate('COUNT');

}

var feedbacks = new GlideAggregate('kb_feedback');
feedbacks.addQuery('sys_created_on', '>=', gs.daysAgo(30));
feedbacks.addAggregate('COUNT');
feedbacks.query();
if(feedbacks.next()) 
   feedback_count = feedbacks.getAggregate('COUNT');

if(view_count!=0)
{
 result=(feedback_count/view_count)*100;
}
answer=result;
