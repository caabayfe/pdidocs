/**
 Service-now.com

 Description:  Parent can't match Child
**/ 
current.setAbortAction(true);
gs.addErrorMessage(
gs.getMessage("The recursive relationship") + " '" + 
current.child.getDisplayValue() + " <i>" + current.type.name + " </i>" + current.parent.getDisplayValue() + "' " + 
gs.getMessage("is not allowed and has not been established"));
