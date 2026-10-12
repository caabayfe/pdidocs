answer = true;

var template_name = current.getValue('name');
if (template_name=='forward-received' || template_name=='reply-received' || template_name=='replyall-received' ||
	template_name=='forward-sent' || template_name=='reply-sent' || template_name=='replyall-sent'){
answer=false;
}
answer;
