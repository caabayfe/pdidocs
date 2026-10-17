/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    // Translating each sentence using translateSync
    let upgradedText = helpers.translateSync('You upgraded your instance around this same time last year.');
    let upgradePrompt = helpers.translateSync('Want to upgrade now? Your new upgrade agent tools have prepared your upgrade for you. Review now and schedule your upgrade.');
    let cloneText = helpers.translateSync('Clone has set your cloning time and profile.');
    let testingText = helpers.translateSync('Testing agent has begun generating tests.');
    let conflictText = helpers.translateSync('Upgrade conflict agent has recommendations to review.');

    let html = `
    <style>
    .text-block {
      font-family: var(--now-font-family, 'Lato');
      font-style: normal;
      font-weight: 400;
      font-size: var(--now-global-font-size--md, 16px);
      color: rgb(var(--now-color_text--primary, 21, 25, 32));
      
    }
    .grid-container {
      display: grid;
      grid-template-columns: auto;
    }
    ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    li {
      font-family: var(--now-font-family, 'Lato');
      font-size: var(--now-global-font-size--md, 16px);
      color: rgb(var(--now-color_text--primary, 21, 25, 32));
      
    }
    </style>

    <div class='grid-container'>
      <div class='text-block'>
        ${upgradedText}
        ${upgradePrompt}
      </div>
      <ul>
        <li>${cloneText}</li>
        <li>${testingText}</li>
        <li>${conflictText}</li>
      </ul>
    </div>
  `;
  
    return html;
}
