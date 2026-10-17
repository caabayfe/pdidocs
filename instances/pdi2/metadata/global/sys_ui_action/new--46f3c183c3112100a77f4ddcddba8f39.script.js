var uri = action.getGlideURI();
uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString('sys_app.do'));
action.setNoPop(true);
