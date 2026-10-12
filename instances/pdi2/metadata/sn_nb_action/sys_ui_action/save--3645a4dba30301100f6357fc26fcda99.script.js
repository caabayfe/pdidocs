if (current.isNewRecord()) {
    current.insert();
} else {
    current.update();
}
action.setRedirectURL(current);
