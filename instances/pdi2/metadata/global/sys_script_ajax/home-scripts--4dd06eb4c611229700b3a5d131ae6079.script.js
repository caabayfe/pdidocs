function homeGetViewName() {
  if (!GlideSecurityManager.get().hasRoles()) 
     answer = "ess";

   return;
}
