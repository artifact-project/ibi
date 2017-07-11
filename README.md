Interface-based instructions
----------------------------
A set of tools for working with code on interfaces-based.<br/>
It is best to use together with [tx-reflector](https://github.com/artifact-project/tx-reflector).


```
npm i --save-dev ibi
```


### Features

 - "Code generation" on interfaces-based
 - Creating Regression Tests



### Code Generation

```ts
const factory: IDeclarationFactory = createDeclarationFactory<T>(
	args: string[],
	defaultHandle(...args) => void,
);

// Где
//   - <T> — Interface of the result-object
//   - args — Array of variable names, the first is a reference to the result-object, the second source-object

interface IDeclarationFactory {
	// Register rules for the `T`-interface
	register<T>(name: string, rules: IRules) => ((...args) => object);

	// Run all registered rules
	exec(names: string[], ...args) => void;
}

interface IRules {
	[propName: string]: true | (handle(...args) => void);
}
```

An example of creating a function for generating DOM-properties based on the input `props`.

```ts
import {createGenerator} from 'ibi';

// Source interface
interface IInputProps {
	name: string;
	value: string;
	disabled?: boolean;
	onInput: (evt: Event) => void;
}

// Result interface
interface IInputDOMAttrs extends IInputProps {
	'aria-disabled': boolean;
}

// Create a factory of declarations
const domAttrs = createDeclarationFactory<IInputDOMAttrs>(
	['attrs', 'srcProps', 'classNames', 'css'],
	(prop, value, attrs, srcProps) => { // Processing `true`
		(srcProps[prop] != null) && (attrs[prop] = srcProps[prop]);
	}
);

// Register the conversion function for `IInputProps`
const inputPropsToAttrs = domAttrs.register<IInputProps>('IInputProps', {
	name: true, // Transfer "as is"
	value: true,
	disabled(prop, value, attrs, srcProps, classNames, css) {
		// In this handler, except `disabled`,
		// define `aria-disabled` and into `classNames` add `css.isDisabled`.
		attrs[prop] = value;

		if (value) {
			attrs[`aria-${prop}`] = value + '';
			classNames.push(css.isDisabled);
		}
	},
	onInput(prop, value, attrs, srcProps) {
		// Add the listener only if not `disabled`
		attrs[prop] = srcProps.disabled ? null : value;
	},
});


// Somewhere in the code, for example React-like component
import css from './Input.css';

export default function InputComponent(props: IInputProps) {
	const attrs = {};
	const classNames = [css.input]; // базовый класс

	inputPropsToAttrs(attrs, props, classNames, css);
	// or domAttrs.exec(['IInputProps'], attrs, props, classNames, css);
	// or better still, if  use `tx-reflector`:
	//   domAttrs.exec(getComponentInterfaces<IInputProps>(this), attrs, props, classNames, css);

	return <input {...attrs} className={classNames.join(' ')}/>;
}
```


### Regressions
Laziness to write an example, so look [tests](./src/regression/regression.tests.ts)

```ts
// ...
```


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)

