function evaluateProperty({
    api,
    helpers
}) {
    const styles = `
        font-family: Lato;
        font-size: 14px;
        font-weight: 400;
        line-height: 16.8px;
        text-align: left;
    `;

    return `
        <div style="${styles}">
            ${helpers.translateSync("This setup has configurations that are in progress.")} 
            <br><br>
            ${helpers.translateSync("Start a new configuration or continue one that is already in progress.")}
        </div>
    `;
}
