function validate(value) { 
    if(!containsOnlyChars( g_user_grouping_separator + " 0123456789-", value))
        return new GwtMessage().getMessage("Invalid integer");
    return true;
}
