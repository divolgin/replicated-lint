# replicated-lint

[![CircleCI](https://circleci.com/gh/replicatedhq/replicated-lint/tree/master.svg?style=svg&circle-token=9ae2573df7075cff352d329eb7f88d52037872b5)](https://circleci.com/gh/replicatedhq/replicated-lint/tree/master)
[![Code Climate](https://codeclimate.com/github/replicatedhq/replicated-lint/badges/gpa.svg)](https://codeclimate.com/github/replicatedhq/replicated-lint) 
[![Test Coverage](https://codeclimate.com/github/replicatedhq/replicated-lint/badges/coverage.svg)](https://codeclimate.com/github/replicatedhq/replicated-lint) 

YAML linting tools for Replicated applications.

This feature is in *alpha*, APIs and behaviors are subject to change without notice.

## Usage

```
npm install --save replicated-lint
```

```typescript
import * as linter from "replicated-lint";

const yaml = `
---
replicated_api_version: 2.8.0
components: 
  - name: ELK
    containers: 
      - image: getelk/search`;


const ruleViolations = linter.lint(yaml, linter.rules.all);
console.log(ruleViolations); // []

```

### CLI

If `replicated-lint` is installed globally, yaml documents can be linted via CLI as well.

Validate the included example file `docs/yamls/check-testproc-runonsave.yml` by piping to `replicated-lint`:


``` 
cat docs/yamls/check-testproc-runonsave.yml | replicated-lint
```

```
{ type: 'info',
  rule: 'prop-configitem-testproc-run-on-save',
  received: 
   { display_name: 'Is this a Phone Number?',
     command: 'regex_match',
     args: 
      [ '([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$',
        'That doesn\'t seem to be a phone number!' ] },
  message: 'If a config item\'s test_proc.run_on_save is not set to \'true\', test_proc\'s will not be checked automatically. Consider setting your test_proc\'s run_on_save to automatically validate inputs',
  positions: 
   [ { path: 'config.1.items.2.test_proc',
       start: { position: 8130, line: 325, column: 4 },
       end: { position: 8322, line: 331, column: 0 } },
     { path: 'config.3.test_proc',
       start: { position: 8692, line: 346, column: 2 },
       end: { position: 9141, line: 365, column: 2 } } ],
  links: [ 'https://www.replicated.com/docs/packaging-an-application/test-procs/' ] }

# prop-configitem-testproc-run-on-save continued from line 321
322  
323    - name: phone_number
324      type: text
325      test_proc:
326        display_name: Is this a Phone Number?
327        command: regex_match
328        args:
329        - "([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$"
330        - "That doesn't seem to be a phone number!"
331  - name: auth
332    title: Authentication
333    description: Where will user accounts be provisioned
334    items:


```




### Custom Rule Sets

`linter.rules.all` can be substituted or extended with custom rule
definitions. A rule's `test` field should return `{ matched: true }` 
when the rule is triggered by invalid JSON.

```typescript
import * as linter from "replicated-lint"; 

const yaml = `
---
foo:
  bar: baz`;

const testSpec: any = {
  Or: {
    preds: [
      {Eq: { path: "foo.bar", value: "baz"}},
      {Eq: { path: "foo.bar", value: "boz"}},
    ],
  }
}

const rules: linter.YAMLRule[] = [
  {
    name: "foo-bar-neq-baz",
    message: "foo.bar can't be baz!",
    test: testSpec,
    type: "error",
  }
];

const ruleViolations = linter.lint(yaml, rules);
console.log(ruleViolations);  /*
[{
        type: "error",
        positions: [{
          path: "foo.bar",
          start: {
            position: 12,
            line: 3,
            column: 2,
          },
          end: {
            position: 20,
            line: 3,
            column: 10,
          },
        }],
        received: "baz",
        rule: "foo-bar-neq-baz",
        message: "foo.bar can't be baz!",
}]
*/
```

Register new rules with `linter.enginer.register`. Rules should implement `JSONReadable<Predicate<any>>`, usually as a static method

```typescript
import * as linter from "replicated-lint"; 

const yaml = `
---
spam: eggs`;

// rule MyRule checks if root object has property "spam" equal to "eggs"
class MyRule implements linter.Predicate<any> {
  test(obj: any) {
    const matched = obj.spam !== "eggs"; // fail when spam != eggs
    const paths = ["spam"];
    return { matched, paths };
  }

  public static fromJson(obj: any, registry: linter.engine.Registry) {
    return new MyRule();
  }
}

linter.engine.register(MyRule);

const testSpec: linter.Test = { MyRule: {}};

const rules: linter.YAMLRule[] = [
  {
    name: "spam-eq-eggs",
    message: "spam must be equal to eggs!",
    test: testSpec,
    type: "error",
  }
];

const ruleViolations = linter.lint(yaml, rules); 
console.log(ruleViolations); // []
```

Custom implementations of `engine.Registry` can also be passed as a third argument to `linter.lint`, otherwise a default 
registry will be used.
