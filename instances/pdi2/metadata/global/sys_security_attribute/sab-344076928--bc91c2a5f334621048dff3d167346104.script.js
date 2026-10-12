answer = isMemberOfQuorumApprovalGroup() || gs.getUserID() == 'system';
function isMemberOfQuorumApprovalGroup() {
    var gr = new GlideRecord('sys_user_grmember');
    gr.addQuery('group', '38ea8d9ec3013010fd385b12b940dda3'); 
    gr.addQuery('user', gs.getUserID());
    gr.query();
    if (gr.next()) {
        return true;
    }
    return false;
}
