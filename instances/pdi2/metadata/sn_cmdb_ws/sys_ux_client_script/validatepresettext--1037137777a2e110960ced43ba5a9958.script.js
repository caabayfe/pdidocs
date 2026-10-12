function script({ api, event, helpers, imports }) {
    // validatePresetText in Map Search Filter UI Controller; fired after each keypress in save preset input
    
    //remove special chars
    var text = event.payload.text.trimStart().replace(/[^\w\s']/gi, '');
    api.setState('savePresetText', text);
    
    //enable save if check passes
    var isValid = /^[0-9a-zA-Z']([\w\s']*[0-9a-zA-Z]){2,}?$/.test(text);
    api.setState('savePresetButtonDisabled', !isValid);
}
