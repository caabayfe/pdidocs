/*
* Before submitting the record, test the remote repo URL with the provided user credentials.
* The process of the test connection running at the back-end is as below:
* 1. Clone the remote repo to make sure the URL is valid and the user has read access
* 2. Create a scratch branch and try a dry-run push to the remote repo to make sure
* the user has write access
* 3. Wipe out the cloned local repo
*/
function submitRepoConfig() {
	testConnection("submit");
	return;
}
