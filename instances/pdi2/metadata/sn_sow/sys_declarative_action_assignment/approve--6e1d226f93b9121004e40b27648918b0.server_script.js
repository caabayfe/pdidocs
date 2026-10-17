if (current.state == 'requested' && (gs.hasRole('approval_admin') || new global.ApprovalDelegationUtil().isMyApproval(current))) {
    current.state = 'approved';
    current.update();
    new global.ApprovalUserFeedback().approved(current);
}
