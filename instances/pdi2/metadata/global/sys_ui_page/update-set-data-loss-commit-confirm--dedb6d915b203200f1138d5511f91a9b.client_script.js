function cancel() {
	destroyDialog();
    return false;
}

// GlideModal and GlideDialogWindow both put the footer inside the body, which messes up the
// formatting. This code moves the footer to be a sibling of the body, which renders correctly
var to_move_up = $('to_move_up');
var oldParent = to_move_up.parentNode;
oldParent.removeChild(to_move_up);
oldParent.parentNode.parentNode.insert(to_move_up);
