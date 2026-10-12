if (!current.collab_member.member)
	answer = false;

var collabChatUtils = new sn_oe_sfs.CollabChatUtils();

answer = gs.getUserID() == current.collab_member.member.user_document || collabChatUtils.isCollabChatMember(current.collab_chat, gs.getUserID());
