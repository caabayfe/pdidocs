var response = JSON.parse(SNC.PATextIndexUtils.runCollection(current.sys_id));
if (response.result === 'error')
	gs.addErrorMessage(response.message);
else
	gs.addInfoMessage(response.message);

action.setRedirectURL(current);
