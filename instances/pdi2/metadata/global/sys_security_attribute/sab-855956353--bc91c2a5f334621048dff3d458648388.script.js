var isImpersonation = new global.SNCAPICallWrapper().isImpersonating();
answer = !isImpersonation;
