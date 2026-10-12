function onCondition() {
   g_form.setMandatory('comments',true);
   g_form.hideFieldMsg('comments');
   var commentsControl = g_form.getControl("comments");
   if (commentsControl && g_form.getValue('comments') == '')
       g_form.showFieldMsg('comments', getMessage('Comments are required when rejecting an approval'), 'error');
}
