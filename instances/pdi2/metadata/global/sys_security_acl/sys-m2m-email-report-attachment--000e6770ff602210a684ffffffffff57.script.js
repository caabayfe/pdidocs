answer = true;
var email = current.email.getRefRecord();
if(email.isValidRecord()) { // << only perform operations on it if it's a valid record
   answer = email.canDelete();
}
