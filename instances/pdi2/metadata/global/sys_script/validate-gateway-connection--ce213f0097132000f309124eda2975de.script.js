var canConnect = SncGatewayConnectionTest.testConnection(current.name,current.type,current.url,current.user,current.password,current.default_catalog);
  
if (!canConnect) {
    current.setAbortAction(true);
    gs.setRedirectURL(current);
    gs.addErrorMessage("Unable to connect to " + current.type + " Gateway, please check the values and try again");
}
