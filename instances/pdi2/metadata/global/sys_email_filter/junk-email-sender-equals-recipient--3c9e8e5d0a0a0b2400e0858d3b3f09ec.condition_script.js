var smtpAccount = new GlideRecord('sys_email_account');
smtpAccount.addQuery('active', true);
smtpAccount.addQuery('type', 'smtp');
smtpAccount.query();

answer = (smtpAccount.next() && (smtpAccount.getValue('user_name') == email.origemail));
