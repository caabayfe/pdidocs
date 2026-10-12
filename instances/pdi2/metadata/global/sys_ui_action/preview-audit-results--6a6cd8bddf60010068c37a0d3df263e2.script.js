current.update();
var msg = new SNC.CertificationProcessing().previewAudit(current.sys_id, current.template.filter.sys_id, current.template.sys_id);
gs.addInfoMessage(msg);
action.setRedirectURL(current);
