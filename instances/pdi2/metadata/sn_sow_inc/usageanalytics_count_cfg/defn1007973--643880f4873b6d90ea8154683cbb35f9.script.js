function recommendationCountByScriptingRGType() {

  var rgType = "d17b2845a39b01100f6357fc26fcda5d"; // Scripting
  var rgTable = "sn_nb_action_resource_generator";
  var recommendationTable = "sn_nb_action_recommended_action";
  var executionTable = "sn_nb_action_detail";

  var resourceGeneratorGr = new GlideRecord(rgTable);
  resourceGeneratorGr.addQuery("generator_type", rgType);
  resourceGeneratorGr.addQuery("context","71e20d52532211101d87ddeeff7b1206"); // incident context
  resourceGeneratorGr.addActiveQuery();
  resourceGeneratorGr.query();
  var resourceGenerators = [];
  while (resourceGeneratorGr.next()) {
    resourceGenerators.push(resourceGeneratorGr.getUniqueValue());
  }

  var actions = [];
  var recommendationGr = new GlideRecord(recommendationTable);
  recommendationGr.addQuery("resource_generator", 'IN', resourceGenerators);
  recommendationGr.addActiveQuery();
  recommendationGr.query();

  while (recommendationGr.next()) {
    actions.push(recommendationGr.getValue("action"));
  }

  var gr = new GlideAggregate(executionTable);
  gr.addQuery('sys_updated_on', '>=', gs.daysAgo(7));
  gr.addQuery('recommended', 'IN', actions);
  gr.addAggregate('COUNT');
  gr.query();
  var count = 0;
  if(gr.next()) count = gr. getAggregate("COUNT");

  return count;
}

answer = recommendationCountByScriptingRGType();
