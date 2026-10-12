/** Scripted User Criteria is not cached, and evaluated everytime, so performance is dependent on the script.
* Populate `answer` with true/false or evaluate to true/false
* The script is evaluated in the scope the user criteria is defined
* Don't use `current` in the script or populate the variable
* Don't use `gs.getUser()` or  `gs.getUserID()`, 
* instead use `user_id` which contains the user sys_id against whom the evaluation is happening.
*/
answer = !gs.hasRole('admin') && (gs.getProperty("glide.ui.polaris.experience") == 'true') && gs.hasRole('evt_team_operator');
