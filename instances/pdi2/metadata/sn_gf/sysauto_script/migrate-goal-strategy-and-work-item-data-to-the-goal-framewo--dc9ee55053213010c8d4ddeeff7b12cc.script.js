/*
1) migrateGoalData --> Setting this paramater to true shall migrate all the goal records in 'goal' table to 'sn_gf_goal' table, with same sysId. Corresponding Target records are created in '	sn_gf_goal_target' table. In the process, it shall create the goal and workItem(Project, Demand, Program) relationship in '	sn_gf_goal_m2m_relationship' table with first goal as primary goal.

2) migrateStrategyData --> Setting this paramater to true shall migrate all the strategy records in 'enterprise_strategy', 'business_unit_strategy' and 'strategic_objective' table to 'sn_gf_strategy' table, with same sysId.

3) migratingGoalStrategyM2Mdata --> Setting this paramater to true shall migrate the records in 'm2m_bu_s_goals' and 'm2m_enterprise_s_goals'. In this process, since the new data model shall not be considering m2m relation of strategy and goals, in order to not loose data, we shall be cloning goals with parent as current goal and set the strategy column for respcetive goals.

	For example- say we have a goal (G1) mapped to 5 strategies S1, S2, S3, S4, S5.
					We shall be creating 4 clone of the goal (G1), and set parent as G1 
					Strategy column of each goal shall be as follows-
					G1 - S1
					Clone1 of G1 - S2
					Clone2 of G1 - S3
					Clone3 of G1 - S4
					Clone4 of G1 - S5
	***Cloned Sub goals will be prefixed with 'Cloned SubGoal:' followed by Parent goal name from which it was cloned.
					
4) migrateStrategyWorkItemRelData --> Setting this paramater true, shall carry forward the relationship of strategy and workItem(Project, Demand, Program), via goal. In case, there is no goal(Strategy as current strategy) with workItem in 'sn_gf_goal_m2m_relationship' table, then we shall be crating a dummyGoal with strategy value of current strategy, and inserting the dummy Goal and workItem relationship in 'sn_gf_goal_m2m_relationship' table.
   ***DummyGoals will be prefixed with 'Goal:' followed by Strategy name.


*/



var jobParamJson = {
    'migrateGoalData': true,
    'migrateStrategyData': true,
    'migratingGoalStrategyM2Mdata': true,
    'migrateStrategyWorkItemRelData': true,
};
new sn_gf.GFDataMigrationUtil().migrateGoalsAndStrategiesData(jobParamJson);
