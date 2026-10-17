var bsm = new SNC.BusinessServiceManager();
var name = bsm.generateTcpEpName(current);
current.setValue('name', name);
