function script({ api, event, helpers, imports }) {
    //script mapDataChanged in SandboxController; fired after either 1) codeEditor content changes relays an event into the sandboxController or 2) a button is clicked which also relay's an event into the sandbox controller 
    debugger;
    var mapData = event.payload.value;
    api.setState('mapData', mapData);
}
