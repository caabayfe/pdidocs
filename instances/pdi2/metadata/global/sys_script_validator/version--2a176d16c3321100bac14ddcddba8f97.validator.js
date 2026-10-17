function validate(value) { 
    if(!containsOnlyChars(".0123456789", value) || value.indexOf("..") != -1 || value.endsWith("."))
        return new GwtMessage().getMessage("Invalid version number.  Must use dot-decimal notation.");

    return true;
}
