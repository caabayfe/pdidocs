var UXKeyboardShortcutRecommender = Class.create();
UXKeyboardShortcutRecommender.prototype = {
  initialize: function () {},

  /**
   * inputShortcut:
   * {
   *   mac: {
   *     shiftKey: true,
   *     altKey: true,
   *     metaKey: false,
   *     key: "o"
   *   },
   *   windows: {
   *     shiftKey: true,
   *     altKey: true,
   *     ctrlKey: false,
   *     key: "o"
   *   }
   * }
   *
   * platform: "mac" | "windows"
   *
   * count: 2
   */
  recommend: function (inputShortcut, platform, count) {
    this._validatePlatform(platform);

    var requestedCount =
      typeof count === "number" && count > 0 ? Math.floor(count) : 2;

    var requested = this._normalizeWrappedShortcut(inputShortcut, platform);
    if (!requested) {
      throw "Invalid inputShortcut";
    }

    var used = this._buildUsedShortcutSet(platform);
    var requestedId = this._toId(requested);
    var hasConflict = used[requestedId] === true;

    var recommendations = [];
    var usedDuringSearch = {};

    // Copy existing used shortcuts so we don't mutate the original
    for (var key in used) {
      if (used.hasOwnProperty(key)) {
        usedDuringSearch[key] = true;
      }
    }

    // If the requested shortcut is free, use it as the first recommendation
    if (!hasConflict) {
      recommendations.push(requested);
      usedDuringSearch[requestedId] = true;
    }

    // Fill remaining slots with the best available alternatives
    while (recommendations.length < requestedCount) {
      var next = this._findBestAvailable(requested, usedDuringSearch, platform);
      if (!next) {
        break;
      }
      recommendations.push(next);
      usedDuringSearch[this._toId(next)] = true;
    }

    return {
      platform: platform,
      foundConflict: hasConflict,
      requested: this._wrapShortcutForPlatform(requested, platform),
      recommendation: recommendations.map(function (r) {
        return this._wrapShortcutForPlatform(r, platform);
      }, this),
      source: 'default',
    };
  },

  _getExistingShortcutsFromTable: function () {
    var results = [];
    var tables = [
      "sys_ux_keyboard_shortcut",
      "sys_ux_keyboard_shortcut_deny_list",
    ];

    for (var t = 0; t < tables.length; t++) {
      var gr = new GlideRecord(tables[t]);
      gr.addQuery("active", true);
      gr.query();
      while (gr.next()) {
        var rawShortcut = gr.getValue("shortcut");
        if (rawShortcut) {
          try {
            results.push(JSON.parse(rawShortcut));
          } catch (e) {
            // Ignore malformed shortcut JSON
          }
        }
      }
    }

    var overrideGr = new GlideRecord("sys_ux_user_override");
    overrideGr.addQuery("category", "shortcut");
    overrideGr.addQuery("user", gs.getUserID());
    overrideGr.query();
    while (overrideGr.next()) {
      var rawOverrides = overrideGr.getValue("overrides");
      if (rawOverrides) {
        try {
          var overrides = JSON.parse(rawOverrides);
          for (var sysId in overrides) {
            if (overrides.hasOwnProperty(sysId)) {
              results.push(overrides[sysId]);
            }
          }
        } catch (e) {
          // Ignore malformed overrides JSON
        }
      }
    }

    return results;
  },

  _buildUsedShortcutSet: function (platform) {
    var used = {};
    var existingShortcuts = this._getExistingShortcutsFromTable();

    for (var i = 0; i < existingShortcuts.length; i++) {
      var normalized = this._normalizeWrappedShortcut(
        existingShortcuts[i],
        platform,
      );
      if (normalized) {
        used[this._toId(normalized)] = true;
      }
    }

    return used;
  },

  _findBestAvailable: function (original, used, platform) {
    var modifierCandidates = this._generateModifierCandidates(
      original,
      platform,
    );
    var i, j, candidate, id;

    for (i = 0; i < modifierCandidates.length; i++) {
      candidate = {
        key: original.key,
        shiftKey: modifierCandidates[i].shiftKey,
        altKey: modifierCandidates[i].altKey,
      };

      if (platform === "mac") {
        candidate.metaKey = modifierCandidates[i].metaKey;
      } else {
        candidate.ctrlKey = modifierCandidates[i].ctrlKey;
      }

      id = this._toId(candidate);
      if (!used[id]) {
        return candidate;
      }
    }

    var letters = "abcdefghijklmnopqrstuvwxyz";
    var start = letters.indexOf(original.key);

    if (start !== -1) {
      for (i = 1; i < letters.length; i++) {
        var forward = (start + i) % letters.length;
        var backward = (start - i + letters.length) % letters.length;

        var nearbyKeys = [letters.charAt(forward), letters.charAt(backward)];

        for (j = 0; j < nearbyKeys.length; j++) {
          candidate = {
            key: nearbyKeys[j],
            shiftKey: original.shiftKey,
            altKey: original.altKey,
          };

          if (platform === "mac") {
            candidate.metaKey = original.metaKey;
          } else {
            candidate.ctrlKey = original.ctrlKey;
          }

          id = this._toId(candidate);
          if (!used[id]) {
            return candidate;
          }
        }
      }
    }

    return null;
  },

  _generateModifierCandidates: function (original, platform) {
    var candidates = [];
    var seen = {};
    var variants;

    if (platform === "mac") {
      variants = [
        {
          shiftKey: !original.shiftKey,
          altKey: original.altKey,
          metaKey: original.metaKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: !original.altKey,
          metaKey: original.metaKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: original.altKey,
          metaKey: !original.metaKey,
        },
        {
          shiftKey: !original.shiftKey,
          altKey: !original.altKey,
          metaKey: original.metaKey,
        },
        {
          shiftKey: !original.shiftKey,
          altKey: original.altKey,
          metaKey: !original.metaKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: !original.altKey,
          metaKey: !original.metaKey,
        },
      ];
    } else {
      variants = [
        {
          shiftKey: !original.shiftKey,
          altKey: original.altKey,
          ctrlKey: original.ctrlKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: !original.altKey,
          ctrlKey: original.ctrlKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: original.altKey,
          ctrlKey: !original.ctrlKey,
        },
        {
          shiftKey: !original.shiftKey,
          altKey: !original.altKey,
          ctrlKey: original.ctrlKey,
        },
        {
          shiftKey: !original.shiftKey,
          altKey: original.altKey,
          ctrlKey: !original.ctrlKey,
        },
        {
          shiftKey: original.shiftKey,
          altKey: !original.altKey,
          ctrlKey: !original.ctrlKey,
        },
      ];
    }

    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];

      if (!this._hasAtLeastOneModifier(v, platform)) {
        continue;
      }

      var id = this._modifierId(v, platform);
      if (!seen[id]) {
        seen[id] = true;
        candidates.push(v);
      }
    }

    return candidates;
  },

  _normalizeWrappedShortcut: function (shortcutWrapper, platform) {
    if (!shortcutWrapper) {
      return null;
    }

    var wrapper = shortcutWrapper;

    if (typeof shortcutWrapper === "string") {
      try {
        wrapper = JSON.parse(shortcutWrapper);
      } catch (e) {
        return null;
      }
    }

    var shortcut = wrapper[platform];
    if (!shortcut || !shortcut.key) {
      return null;
    }

    var normalized = {
      key: (shortcut.key + "").toLowerCase(),
      shiftKey: this._toBoolean(shortcut.shiftKey),
      altKey: this._toBoolean(shortcut.altKey),
    };

    if (platform === "mac") {
      normalized.metaKey = this._toBoolean(shortcut.metaKey);
    } else {
      normalized.ctrlKey = this._toBoolean(shortcut.ctrlKey);
    }

    if (!this._hasAtLeastOneModifier(normalized, platform)) {
      return null;
    }

    return normalized;
  },

  _wrapShortcutForPlatform: function (shortcut, platform) {
    var wrapped = {
      mac: {},
      windows: {},
    };

    if (platform === "mac") {
      wrapped.mac = {
        shiftKey: shortcut.shiftKey,
        altKey: shortcut.altKey,
        metaKey: shortcut.metaKey,
        key: shortcut.key,
      };
    } else {
      wrapped.windows = {
        shiftKey: shortcut.shiftKey,
        altKey: shortcut.altKey,
        ctrlKey: shortcut.ctrlKey,
        key: shortcut.key,
      };
    }

    return wrapped;
  },

  _toBoolean: function (value) {
    return value === true || value === "true" || value === 1 || value === "1";
  },

  _hasAtLeastOneModifier: function (shortcut, platform) {
    if (platform === "mac") {
      if (!(shortcut.shiftKey || shortcut.altKey || shortcut.metaKey)) {
        return false;
      }
    } else {
      if (!(shortcut.shiftKey || shortcut.altKey || shortcut.ctrlKey)) {
        return false;
      }
    }

    return !this._isShiftOnlyCombo(shortcut, platform);
  },

  _isShiftOnlyCombo: function (shortcut, platform) {
    if (!shortcut.shiftKey) {
      return false;
    }

    if (platform === "mac") {
      return !shortcut.altKey && !shortcut.metaKey;
    }

    return !shortcut.altKey && !shortcut.ctrlKey;
  },

  _modifierId: function (shortcut, platform) {
    if (platform === "mac") {
      return [
        shortcut.shiftKey ? "shift" : "",
        shortcut.altKey ? "alt" : "",
        shortcut.metaKey ? "meta" : "",
      ].join("|");
    }

    return [
      shortcut.shiftKey ? "shift" : "",
      shortcut.altKey ? "alt" : "",
      shortcut.ctrlKey ? "ctrl" : "",
    ].join("|");
  },

  _toId: function (shortcut) {
    return [
      shortcut.shiftKey ? "shift" : "",
      shortcut.altKey ? "alt" : "",
      shortcut.metaKey ? "meta" : "",
      shortcut.ctrlKey ? "ctrl" : "",
      shortcut.key,
    ].join("|");
  },

  _validatePlatform: function (platform) {
    if (platform !== "mac" && platform !== "windows") {
      throw 'Invalid platform. Expected "mac" or "windows".';
    }
  },

  type: "UXKeyboardShortcutRecommender",
};
