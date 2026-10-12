function script({api, event}) {
var requestedType = event.payload?.requestedType || "";
var aiGroupInfo = !api.state.aiGroupInfo ? {} : {...api.state.aiGroupInfo};
aiGroupInfo.requestedType = requestedType;
api.setState('aiGroupInfo', aiGroupInfo);
api.setState('currentPage',0);
}
