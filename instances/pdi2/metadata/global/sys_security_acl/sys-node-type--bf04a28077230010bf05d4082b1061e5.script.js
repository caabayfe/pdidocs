var defaultNodeTypes = new VNCCNodeUtil().getDefaultNodeTypes();
var nodeTypeNotOOB = defaultNodeTypes.indexOf(current.getValue("name")) == -1;

var inUseNodeTypes = new VNCCNodeUtil().getInUseNodeTypes();
var nodeTypeNotInUse = inUseNodeTypes.indexOf(current.getUniqueValue()) == -1;

answer = nodeTypeNotOOB && nodeTypeNotInUse;
