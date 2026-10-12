gs.print('step = ' + step);
gs.print('users - ' + step_users);
setApprovers();

function setApprovers() {
    var helper = new GlideappTaskApprovalHelper();
    helper.setApprovals(current, step, step_users);
}
