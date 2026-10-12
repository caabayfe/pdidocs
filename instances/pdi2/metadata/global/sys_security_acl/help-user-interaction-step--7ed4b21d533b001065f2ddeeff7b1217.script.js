answer = false;

if (!current.user_interaction.nil() && !current.user_interaction.user.nil()) {
	answer = (current.user_interaction.user == gs.getUserID());
} else if (!current.user.nil()) {
	answer = (current.user == gs.getUserID());
}
