var lua_result = SNC.ProcessorPolicyLUA.calculateLUA();
var lua_json = JSON.parse(lua_result);
var sm = new GCFSampleMap();
sm.put('ip', lua_json.ip.toString());
sm.put('role', lua_json.role.toString());
sm.put('ip_role', lua_json.ip_role.toString());
sm.put('ip_or_role', lua_json.ip_or_role.toString());
sm.put('ip_and_role', lua_json.ip_and_role.toString());
GCFCollector.recordUsageEvent('access_policy','processor','policy_criteria',sm);

var api_sm = new GCFSampleMap();
api_sm.put('api_ip', lua_json.api_ip.toString());
api_sm.put('api_role', lua_json.api_role.toString());
api_sm.put('api_ip_role', lua_json.api_ip_role.toString());
api_sm.put('api_ip_or_role', lua_json.api_ip_or_role.toString());
api_sm.put('api_ip_and_role', lua_json.api_ip_and_role.toString());
GCFCollector.recordUsageEvent('access_policy','processor','api_policy_criteria',api_sm);

var auth_sm = new GCFSampleMap();
auth_sm.put('basic_auth', lua_json.basic_auth.toString());
auth_sm.put('bearer_token_auth', lua_json.bearer_token_auth.toString());
auth_sm.put('oidc_auth', lua_json.oidc_auth.toString());
auth_sm.put('mutual_auth', lua_json.mutual_auth.toString());
auth_sm.put('custom_auth', lua_json.custom_auth.toString());
auth_sm.put('wsse_auth', lua_json.wsse_auth.toString());
GCFCollector.recordUsageEvent('access_policy','processor','api_auth_profile',auth_sm);
gs.info('Processor access policy monthly report generation is finished.');
