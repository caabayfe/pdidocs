function validate(value) { 
   if (value == null || value == "")
      return true;
   if (isEmailValid(value))
      return true;
   else
      return new GwtMessage().getMessage("Invalid email address");
}
