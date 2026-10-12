var targetURL = 'transaction_call_chain_register.do?sys_id=-1&sysparm_query=url=' + GlideStringUtil.urlEncode(current.url.toString().replaceAll('^','^^'));
action.setRedirectURL(targetURL);
