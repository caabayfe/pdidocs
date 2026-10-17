var to_imp = sys_user;
if (to_imp == null || to_imp == '')
    to_imp = imp_recent;

if (to_imp == gs.getImpersonatingUserName())
   session.onlineUnimpersonate();
else if (to_imp != gs.getUser().getID())
   doImpersonate(to_imp);

response.sendRedirect('./navpage.do');

function doImpersonate(new_user) {
   var old_user = session.onlineImpersonate(new_user);
   if (old_user==null) {
      gs.addErrorMessage(gs.getMessage("The user you selected could not be impersonated, typically this is because they had a blank login id"));
   }
}
