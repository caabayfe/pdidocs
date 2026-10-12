/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let percentage = 0;
    const totalSteps = api?.data?.get_bp_steps_completed_1?.output?.totalSteps;
    const completedSteps = api?.data?.get_bp_steps_completed_1?.output?.completedSteps;
    if (totalSteps != null && totalSteps != undefined && completedSteps != null && completedSteps != undefined){
        percentage = Math.floor(completedSteps / totalSteps * 100);
    } else {
        return;
    }
    let html = `
      <style>
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
          background: rgb(var(--now-color_background--secondary, 246, 247, 247));
          position: absolute;
        }
        .message {
          margin-top: calc(calc(var(--circle-diameter) - var(--arc-width))/2 - 1.5rem);
          font-size: var(--now-global-font-size--xl, 24px);
          line-height: 29px;
          text-align: center;
          font-weight: 300;
          font-family: var(--now-font-family, 'Lato');
          font-style: normal;
        }
      </style>
      <div class="container">
        <style>
            * {
          --percentage: ${percentage};
          --circle-diameter: 7.5rem;
          --arc-width: 2rem;
          --total-color: rgb(var(--now-color_background--tertiary, 228, 230, 231));
          --rotation-angle: calc(var(--percentage)*1.8deg);
          --value-color: linear-gradient(calc( -90deg - 1 * var(--rotation-angle)), #007ACF calc(7.09%), #5053D8 calc(40.03%), #B2B4E2 calc(90.78%))
          }  
        </style>
        <div class="top"></div>
        <div class="clipper-bottom">
          <div class="bottom-up"></div>
          <div class="bottom-down">
          </div>
        </div>
        <div class="center">
            <div class="message">${completedSteps}/${totalSteps}</div>
        </div>
      </div>
      `;

    return html;
}
