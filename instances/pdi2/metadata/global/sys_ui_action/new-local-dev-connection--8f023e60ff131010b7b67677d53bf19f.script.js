createLocalDevConnection();

function createLocalDevConnection() {
     new sn_ais.InfrastructureApi().addActiveAisConnection("http://localhost:9090");
	action.setRedirectURL("/ais_connection_list.do");
}
