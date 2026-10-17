function transform(input){
	var botName = input.line_bot_name;
	return new sn_va_line.VALineMessengerCustomBotInstall().getBotInfo(botName);
}
