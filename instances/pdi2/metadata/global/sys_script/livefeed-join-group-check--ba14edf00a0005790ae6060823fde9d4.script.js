if (!(new LiveFeedUtil().hasSessionJoinPermission(current.group)) && !current.isActionAborted()) {
    gs.addInfoMessage(gs.getMessage('Invitation generated for') + ' ' + gs.getUser().getDisplayValue());
    current.state = 'invited';
}
