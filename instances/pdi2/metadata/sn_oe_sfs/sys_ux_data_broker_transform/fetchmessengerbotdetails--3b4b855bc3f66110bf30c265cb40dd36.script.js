function transform(input){
	var botName = input.messenger_bot_name;
	var inbound_id = input.inbound_id;
	return new sn_va_fb_messenger.VAFBMessengerCustomBotInstall().getBotInfo(botName, inbound_id);
}
