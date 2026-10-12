answer = gs.getSession().isLoggedIn() || gs.getProperty('glide.security.allow_unauth_roleless_acl', 'false').toLowerCase() === 'true';
