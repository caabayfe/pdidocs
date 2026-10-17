var currentId = String(current.sys_id);
var newVersionId = SNC.VersionControl.revertTo(current, false);
(new VersionControlUtil).redirect('cert_template', newVersionId);

var desiredStateUtil = new DesiredStateUtil;
var clonedCondition = desiredStateUtil.clonedConditions(currentId);
desiredStateUtil.copyConditions(currentId, newVersionId, clonedCondition);
