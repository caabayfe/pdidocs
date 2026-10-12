if(event.parm1 != "skip")
	CreateActivity();

function CreateActivity()
{
	if(current.revised_by)
		new ActivitySubscriptionContext().getActivityService().createActivity(current,"revised");
	else
		new ActivitySubscriptionContext().getActivityService().createActivity(current,"posted");
}
