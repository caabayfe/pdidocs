var answer = getDigestPartUserAnswer();

function getDigestPartUserAnswer() {
	return current.user == gs.getUserID() || gs.hasRole("email_digest_admin");
};
