var answer = getDigestUserPreferenceAnswer();

function getDigestUserPreferenceAnswer() {
	return !current.user || current.user == gs.getUserID();
};
