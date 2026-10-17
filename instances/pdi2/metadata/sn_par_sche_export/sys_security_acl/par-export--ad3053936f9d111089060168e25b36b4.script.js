var answer = false;
if (!current.isNewRecord()) {
    var myUserId = gs.getUserName();
    var isMe = (myUserId == current.sys_created_by);
    if (isMe) {
        answer = true;
    } else {
        answer = false;
    }
} else {
    answer = true;
}
