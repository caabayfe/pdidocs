var countOfGoals = 0;
var gr = new GlideAggregate('sn_gf_goal_m2m_relationship');
gr.setGroup(true);
gr.groupBy("goal");
gr.addAggregate("COUNT","sys_id");
gr.query();
while(gr.next()){
    var goalRelationships = gr.getAggregate("COUNT","sys_id");
    if(goalRelationships > 1){
        ++countOfGoals;
    }
}
answer = countOfGoals;
