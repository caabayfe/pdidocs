validateRegEx(current.name);

function validateRegEx(pattern) {
  if (pattern == '.*') {
    gs.addErrorMessage('Name cannot be ".*" - this would exclude all tables from clone');
    current.setAbortAction(true);
	return;
  }
   
  try {
    Packages.java.util.regex.Pattern.compile(pattern);
  } catch (e) {
    gs.addErrorMessage('Name is not a valid regular expression');
    current.setAbortAction(true);
	return;
  }
}
