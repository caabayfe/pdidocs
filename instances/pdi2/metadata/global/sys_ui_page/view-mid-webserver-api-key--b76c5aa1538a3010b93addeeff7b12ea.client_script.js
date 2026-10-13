function copyApiKeyToClipboard() {
    var input = document.createElement("textarea");
    input.innerHTML = $("apiKey").value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}
