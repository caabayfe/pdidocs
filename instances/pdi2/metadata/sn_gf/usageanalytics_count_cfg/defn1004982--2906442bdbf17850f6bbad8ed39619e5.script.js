var countOfGoals = 0;
var gr = new GlideAggregate('sn_gf_goal_target');
gr.setGroup(true);
gr.groupBy("goal");
gr.addAggregate("COUNT","sys_id");
gr.query();
while(gr.next()){
	var targetCount = gr.getAggregate("COUNT","sys_id");
	if(targetCount>=1 && targetCount<=5){
		++countOfGoals;
	}
}
answer = countOfGoals;
