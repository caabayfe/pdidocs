function script({api, event}) { 
    api.setState("policiesListRefresh", { timestamp: new Date() });
}
