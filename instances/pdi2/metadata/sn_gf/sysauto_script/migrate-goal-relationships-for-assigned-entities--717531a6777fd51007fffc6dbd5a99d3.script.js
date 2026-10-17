/*
 Migration of data from goals M2M table to goal table --> Setting this paramater with Assign Entity tables from 'sn_gf_assigned_entity_config' table will migrate data from 'sn_gf_goal_m2m_relationship' table to 'sn_gf_goal' table.
 
 - If the goal is having single relationship with assign entity table type, then the assign entity type and assign entity fields on 'sn_gf_goal' table will be populated from corresponding values from 'sn_gf_goal_m2m_relationship' table.
 - If the goal is having multiple relationships with assign entity table type, then n(no of relationships) new cloned subgoals will be created and the assign entity type and assign entity fields on 'sn_gf_goal' table will be populated from corresponding values from 'sn_gf_goal_m2m_relationship' table for each cloned sub goals.

 Goals M2M relationship related records will be deleted.
*/

var entities = null;// Entities configured in sn_gf_assigned_entity_config table need to be provied here with comma sepration for which only migration should run, otherwise migration will be done for all the entities defined in sn_gf_assigned_entity_config.

new sn_gf.GFGoalMtoM_Migration().process(entities);
