var sm = GlideSecurityManager.get();
var checkMe = 'record/' + root_rule + '/write';
answer = sm.hasRightsTo(checkMe, current);
 
