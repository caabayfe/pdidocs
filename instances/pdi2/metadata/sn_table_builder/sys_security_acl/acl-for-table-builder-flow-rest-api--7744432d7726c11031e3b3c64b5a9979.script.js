//Check if user has flow_designer role or delegated developer has flow_designer permission
var gr = new GlideRecord('sys_hub_flow');
answer = gs.hasRightsTo("ui/configure.personalize_flows/write", null) || gr.canWrite();
