var unauthChgRequest = new UnauthorizedChangeRequest();

if (unauthChgRequest.isUnauthorizedEnabled() && event.parm1)
	unauthChgRequest.createUnauthorizedChange(event.parm1, event.parm2);
