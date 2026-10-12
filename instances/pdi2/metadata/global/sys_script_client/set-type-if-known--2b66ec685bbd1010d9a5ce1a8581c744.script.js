function onLoad() {
    /*
     * Set type and update options if the user is coming from the profile 
     * form to create and link a dictionary to that profile
     */
    if (g_form.isNewRecord()) {
        // If the desired type of the new dictionary is known, try to use it
        var type = g_scratchpad.dictionary_type;
        var allowSpellCheck = g_scratchpad.allow_spellcheck;
        if (type != null && type.length > 0) {
            // We can always use it if the desired type isn't spellcheck, or spellcheck is explicitly allowed
            if (allowSpellCheck == "true" || type !== "SPELLCHECK") {
                g_form.setValue("type", type);
            } else {
                // ...otherwise we can't allow a new spellcheck dictionary since you can only have 1 per profile
                g_form.addInfoMessage("You can only have one spellcheck dictionary per profile, but you can create a different type of dictionary if you'd like.");
            }
        }
        // If spellcheck dictionaries aren't explicitly allowed, we remove the option, since the creation of spellcheck dictionaries is managed by the profile
        if (allowSpellCheck !== "true") {
            g_form.removeOption('type', 'SPELLCHECK');
        }
    }
}
