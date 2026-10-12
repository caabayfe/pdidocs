var infoMessage = gs.getMessage("You have approved this request.");
var errorMessage = gs.getMessage("Request could not be approved try again.");
var accessDeniedMessage = gs.getMessage("You do not have access to this request.");

if (State == 'rejected') {
    infoMessage = gs.getMessage("You have rejected this request.");
    errorMessage = gs.getMessage("Request could not be rejected try again.");
}
var todoApprovalActionsUtil = new sn_ex_sp.TodoApprovalActionsUtil();

updateWithComments(sys_id, State, clientScriptOutput);

function updateWithComments(sys_id, State, clientScriptOutput) {

    var gr = new GlideRecord('sysapproval_approver');
    gr.addQuery('sys_id', sys_id);
    gr.query();

    if (gr.next()) {
        if (!todoApprovalActionsUtil.isApprover(gr)) {
            gs.addErrorMessage(accessDeniedMessage);
            return;
        }

        gr.state = State;
        if (State == 'rejected') {
            clientScriptOutput = gs.getMessage("Reason for rejection: {0}", clientScriptOutput);
        }

        // if action is on sc_request then update comments in sc_req_item when a single ritm associated
        if (gr.sysapproval && gr.sysapproval.sys_class_name == 'sc_request') {
            var itemsCountGa = new GlideAggregate('sc_req_item');
            itemsCountGa.addQuery('request', gr.sysapproval);
            itemsCountGa.addAggregate('COUNT');
            itemsCountGa.query();
            var count = (itemsCountGa.next()) ? itemsCountGa.getAggregate('COUNT') : 0;
            if (count == 1) {
                updateRITMComments(gr);
            } else {
                if (!todoApprovalActionsUtil.checkRejectionCommentRequired(gr)) {
                    gs.addErrorMessage(accessDeniedMessage);
                    return;
                }
                gr.comments = clientScriptOutput;
            }
        } else if (gr.sysapproval && gr.sysapproval.sys_class_name == 'sc_req_item') {
            updateRITMComments(gr);
        } else {
            if (!todoApprovalActionsUtil.checkRejectionCommentRequired(gr)) {
                gs.addErrorMessage(accessDeniedMessage);
                return;
            }
            gr.comments = clientScriptOutput;
        }

        if (gr.update() == null) {
            gs.addErrorMessage(errorMessage);
        } else {
            gs.addInfoMessage(infoMessage);
        }
    }
}

function updateRITMComments(gr) {
    var itemGr = new GlideRecord('sc_req_item');
    if (gr.sysapproval.sys_class_name == 'sc_req_item') {
        itemGr.addQuery('sys_id', gr.sysapproval);
    } else {
        itemGr.addQuery('request', gr.sysapproval);
    }
    itemGr.query();
    if (itemGr.next()) {
        if (!todoApprovalActionsUtil.checkRejectionCommentRequired(itemGr)) {
            gs.addErrorMessage(accessDeniedMessage);
            return;
        }
        itemGr.comments = clientScriptOutput;
        if (itemGr.update() == null) {
            gs.addErrorMessage(errorMessage);
        }
    }
}
