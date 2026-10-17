function sc_req_itemGetViewName() {
  if (!GlideSecurityManager.get().hasRoles()) 
     answer = "ess";

   return;
}

function sc_cat_itemGetViewName() {
  if (!GlideSecurityManager.get().hasRoles()) 
     answer = "ess";

   return;
}
