answer = gs.getSession().isLoggedIn();
if (!answer){
answer = gs.getProperty('glide.security.allow_unauth_roleless_acl', false); }
