answer = (new global.SNCAPICallWrapper().isImpersonating() && gs.getProperty('com.snc.hr.core.impersonateCheck') == 'true') == false;
