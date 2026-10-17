(function executeRule(current, previous /*null when async*/ ) {
    let payload = {};
    const strings = [];

    try {
        payload = current.hook_payload ? JSON.parse(current.hook_payload) : [];
        switch (current.hook_type.toString()) {
            case 'NOW_ALERT#DUPLICATE_BANNER': {
                strings.push(payload.message);
                strings.push(...payload.actions.map((action) => action?.buttonText));
                break;
            }
            case 'NOW_MODAL#DUPLICATE_POPUP': {
                strings.push(payload.message);
                strings.push(payload.buttonText);
                break;
            }
        }
    } catch (e) {
        gs.warn("Unable to parse hook_payload for translation extraction", e);
    }

    const translations = strings.map((s) => ({
        message: s,
        code: 'sys_uib_hook_string',
        comment: ''
    }));
    current.required_translations = JSON.stringify(translations);
})(current, previous);
