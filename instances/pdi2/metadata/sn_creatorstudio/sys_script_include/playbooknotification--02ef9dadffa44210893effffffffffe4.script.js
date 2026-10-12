const PlaybookNotification = (function () {
  return class PlaybookNotification {
    static type = "PlaybookNotification";

    static LEVELS = {
      WARNING: "WARNING",
      CRITICAL: "CRITICAL",
      INFO: "INFO",
    };

    static #containerBaseStylesPt1 =
      "display:flex;align-items:center;min-height:1.625rem;border-radius:var(--now-alert--border-radius);";
    static #containerBaseStylesPt2 =
      "color:RGB(var(--now-color_text--primary));padding:0.25rem 0.75rem;font-size:0.75rem;font-family:var(--now-alert--font-family);";

    static #ALERTS = {
      WARNING: {
        imgSrc: "sn_creatorstudio.validation-warning.png",
        defaultMessage: gs.getMessage(
          "This activity was skipped because there isn't an assignee."
        ),
        containerStyles: `${PlaybookNotification.#containerBaseStylesPt1}${
          PlaybookNotification.#containerBaseStylesPt2
        }background:RGB(var(--now-color_alert--warning-0));border:1px solid RGB(var(--now-alert--warning--border-color))`,
      },
      // additional alert configs go here
    };

    static alert(
      level = PlaybookNotification.LEVELS.WARNING,
      message = PlaybookNotification.#ALERTS.WARNING.defaultMessage
    ) {
      if (!PlaybookNotification.LEVELS[level])
        return gs.getMessage("Unsupported alert level");

      return `
			<div role="alert" style="${
        PlaybookNotification.#ALERTS[level].containerStyles
      }">
				<img style="padding: 0.25rem" src="${
          PlaybookNotification.#ALERTS[level].imgSrc
        }" width="12" height="12" alt="!" />
				<div style="display: flex; align-items: center; height: 1.25rem; padding: 0.25rem;">
					<span>${message}</span>
				</div>
			</div>
		`;
    }
  };
})();
