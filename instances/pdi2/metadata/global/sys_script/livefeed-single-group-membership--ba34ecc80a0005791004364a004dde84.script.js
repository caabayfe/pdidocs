if (new LiveFeedUtil().isDuplicateMember(current)) {
    gs.addInfoMessage(current.member.getDisplayValue() + " " + 
        gs.getMessage("is already a member of group") + " " + current.group.getDisplayValue());
    current.setAbortAction(true);
}
