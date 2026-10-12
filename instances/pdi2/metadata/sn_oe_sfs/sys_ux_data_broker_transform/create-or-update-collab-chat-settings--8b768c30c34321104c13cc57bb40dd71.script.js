function transform(input) {
	const enableEmojis = input.enable_emojis.value;
	const enableTeams = input.enable_teams.value;
	const enabled = input.enabled.value;
	const enableParticipantSuggestions = input.enable_participant_suggestions.value;
	const enableLegacySupport = input.enable_legacy_support.value;
	return sn_collab.CollabChatScriptObject.createOrUpdateSettingsRecord(enabled, enableTeams, enableEmojis, enableParticipantSuggestions, enableLegacySupport);
}
