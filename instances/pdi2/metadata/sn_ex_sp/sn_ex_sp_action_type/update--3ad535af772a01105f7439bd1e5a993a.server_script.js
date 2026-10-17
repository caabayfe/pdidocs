var infoMessage = gs.getMessage("You have approved this request.");
var errorMessage = gs.getMessage("Request could not be approved try again.");
var accessDeniedMessage = gs.getMessage("You do not have access to this request.");

if (State == "rejected") {
    infoMessage = gs.getMessage("You have rejected this request.");
    errorMessage = gs.getMessage("Request could not be rejected try again.");
}

var gr = new GlideRecord('sysapproval_approver');
gr.addQuery('sys_id', sys_id);
gr.query();
if (gr.next()) {
    if (!new sn_ex_sp.TodoApprovalActionsUtil().isApprover(gr)) {
        gs.addErrorMessage(accessDeniedMessage);
    } else {
        gr.state = State;
        if (gr.update() == null) {
            gs.addErrorMessage(errorMessage);
        } else {
            gs.addInfoMessage(infoMessage);
        }
    }
}
