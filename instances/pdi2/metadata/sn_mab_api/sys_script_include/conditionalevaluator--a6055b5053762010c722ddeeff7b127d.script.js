class ConditionalEvaluator {
  constructor() {
    this.errorHandler = new sn_mab_api.ErrorHandler();
  }

  static getEvaluator(conditionalType, conditionalValue) {
    switch (conditionalType) {
      case 'childHasKey':
        return new ChildHasKeyEvaluator(conditionalValue);
      case 'parentHasKey':
        return new ParentHasKeyEvaluator(conditionalValue);
      case 'aParentHasKey':
        return new AParentHasKeyEvaluator(conditionalValue);
      case 'noParentHasKey':
        return new NoParentHasKeyEvaluator(conditionalValue);
      case 'aParentHasAnyOfKeys':
        return new AParentHasAnyOfKeysEvaluator(conditionalValue);
      case 'noParentHasAnyOfKeys':
        return new NoParentHasAnyOfKeysEvaluator(conditionalValue);
      case 'isRoot':
        return new IsRootEvaluator();
      default:
        this.errorHandler.throwBadConfigError(
          'Invalid conditionalType received: ' + conditionalType
        );
    }
  }

  static evaluate(conditional, configKeyStack, childConfigMetadata) {
    if (!conditional) {
      this.errorHandler.throwInternalError('condition must be provided');
    }

    let matches = true;

    Object.keys(conditional).forEach((conditionalType) => {
      const evaluator = ConditionalEvaluator.getEvaluator(
        conditionalType,
        conditional[conditionalType]
      );
      if (evaluator instanceof ChildHasKeyEvaluator)
        matches &= evaluator.evaluate(childConfigMetadata);
      else matches &= evaluator.evaluate(configKeyStack);
    });

    return matches;
  }
}

class ChildHasKeyEvaluator {
  constructor(conditionalValue) {
    this.conditionalValue = conditionalValue;
  }

  evaluate(childConfigMetadata) {
    return (
      childConfigMetadata &&
      this.conditionalValue == childConfigMetadata.getConfigKey()
    );
  }
}

class ParentHasKeyEvaluator {
  constructor(conditionalValue) {
    this.conditionalValue = conditionalValue;
  }

  evaluate(configKeyStack) {
    return (
      configKeyStack.length &&
      configKeyStack[configKeyStack.length - 1].configKey ==
        this.conditionalValue
    );
  }
}

class AParentHasKeyEvaluator {
  constructor(conditionalValue) {
    this.conditionalValue = conditionalValue;
  }

  evaluate(configKeyStack) {
    const localConditionalValue = this.conditionalValue;
    let hasKey = false;

    if (configKeyStack && configKeyStack.length) {
      configKeyStack.forEach((currConfigKeyEntry) => {
        hasKey =
          hasKey || currConfigKeyEntry.configKey == localConditionalValue;
      });
    }

    return hasKey;
  }
}

class NoParentHasKeyEvaluator extends AParentHasKeyEvaluator {
  evaluate(configKeyStack) {
    const aParentHasKey = super.evaluate(configKeyStack);
    return !aParentHasKey;
  }
}

class AParentHasAnyOfKeysEvaluator {
  constructor(conditionalValues) {
    this.conditionalValues = conditionalValues;
  }

  evaluate(configKeyStack) {
    const localConditionalValues = this.conditionalValues;
    let hasKey = false;

    if (configKeyStack && configKeyStack.length) {
      configKeyStack.forEach((currConfigKeyEntry) => {
        hasKey =
          hasKey ||
          localConditionalValues.indexOf(currConfigKeyEntry.configKey) > -1;
      });
    }

    return hasKey;
  }
}

class NoParentHasAnyOfKeysEvaluator extends AParentHasAnyOfKeysEvaluator {
  evaluate(configKeyStack) {
    const aParentHasAnyOfKeys = super.evaluate(configKeyStack);
    return !aParentHasAnyOfKeys;
  }
}

class IsRootEvaluator {
  evaluate(configKeyStack) {
    return configKeyStack.length && configKeyStack.length == 1;
  }
}

module.exports = ConditionalEvaluator;
