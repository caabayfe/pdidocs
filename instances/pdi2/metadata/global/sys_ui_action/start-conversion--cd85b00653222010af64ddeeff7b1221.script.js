function notify() {
    gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert_convert');
}
current.insert();
action.setRedirectURL(current);
