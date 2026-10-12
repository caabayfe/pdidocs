var isACC = gs.hasRole('agent_client_collector_admin') || gs.hasRole('agent_client_collector_user');
var isItil = gs.hasRole('itil');
answer = isACC && isItil;
