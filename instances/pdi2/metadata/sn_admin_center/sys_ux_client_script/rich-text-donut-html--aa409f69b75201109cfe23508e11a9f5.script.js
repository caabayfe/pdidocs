/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        installedApps,
        totalApps
    } = api.context.props;
    let percentage = Math.floor(installedApps / totalApps * 100);
    let html = `
      <style>
        * {
          --percentage: ${percentage};
          --circle-diameter: 13.25rem;
          --arc-width: 3rem;
          --total-color: rgb(var(--now-color_background--tertiary, 228, 230, 231));
          --rotation-angle: calc(var(--percentage)*1.8deg);
          --value-color: linear-gradient(calc( -90deg - 1 * var(--rotation-angle)), #007ACF calc(7.09%), #5053D8 calc(40.03%), #B2B4E2 calc(90.78%))
        }
        .container {
          height: calc(var(--circle-diameter) * 0.5);
          overflow: hidden;
          position: relative;
          top: 0;
          left: 0;

        }
        .top {
          background: var(--total-color);
          height: var(--circle-diameter);
          width: var(--circle-diameter);
          border-top-left-radius: 50%;
          border-top-right-radius: 50%;
        }
  
        .clipper-bottom {
          height: var(--circle-diameter);
          width: var(--circle-diameter);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          margin-top: calc(var(--circle-diameter) * -1);
          transform: rotate(var(--rotation-angle));
          overflow: hidden;
          transition: transform .8s ease-in-out;
          transition-delay: 2s;
        }
        .bottom-up {
          background: transparent;
          flex: 1 0 auto;
        }
        .bottom-down {
          background: var(--value-color);
          flex: 1 0 auto;
          border-top: 2px rgb(var(--now-color--neutral-0, 255, 255, 255)) solid;
        }
        .center {
          height: calc(var(--circle-diameter) - var(--arc-width));
          width: calc(var(--circle-diameter) - var(--arc-width));
          border-radius: 50%;
          top: calc(var(--arc-width)/2);
          left: calc(var(--arc-width)/2);
          background: rgb(var(--now-color_background--primary, 255, 255, 255));
          position: absolute;
        }
        .message {
          margin: calc(calc(var(--circle-diameter)/2) - var(--arc-width)) auto;
          font-size: 1.75rem;
          line-height: 1.75rem;
          width: max-content;
          font-weight: 300;
          font-family: var(--now-font-family, 'Lato');
          font-style: normal;
        }
      </style>
      <div class="container">
        <div class="top"></div>
        <div class="clipper-bottom">
          <div class="bottom-up"></div>
          <div class="bottom-down">
          </div>
        </div>
        <div class="center">
            <div class="message">
              <span aria-label="${installedApps} out of ${totalApps} applications installed">${installedApps}/${totalApps}</span>
            </div>
        </div>
      </div>
      `;

    return html;
}
