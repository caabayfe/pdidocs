var answer = false;
if (!current.isNewRecord()) {
    var myUserId = gs.getUserName();
    var isMe = (myUserId.toLowerCase() == current.sys_created_by.toString().toLowerCase());
    if (isMe) {
        answer = true;
    } else {
        answer = false;
    }
} else {
    answer = true;
}
