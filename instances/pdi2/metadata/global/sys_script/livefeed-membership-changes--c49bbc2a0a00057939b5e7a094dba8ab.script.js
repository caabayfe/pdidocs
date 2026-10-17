if (!(new LiveFeedUtil().canSessionUpdateMembership())) {
    gs.addInfoMessage(gs.getMessage('Admin privileges required to change group memberships'));
    current.setAbortAction(true);
}
