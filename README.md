Interface-based instructions
----------------------------
Набор инструментов для работы с кодом основаном на интерфейсах.


### Возможности

 - «Генерация кода» на основе интерфейса
 - Создание регрессионных тестов



### Генерация кода

```ts
const factory: IDeclarationFactory = createDeclarationFactory<T>(
	args: string[],
	defaultHandle(...args) => void,
);

// Где
//   - <T> — итоговый итервейс аттрибутов
//   - args — массив имён переменных, перым идет ссылка на итоговые аттрибуты, вторым исходные

interface IDeclarationFactory {
	// Зарегистрировать правила для `T`-интерфейса
	register<T>(name: string, rules: IRules) => ((...args) => object);

	// Выполнить все перечисленные и зарегистрированные функции
	exec(names: string[], ...args) => void;
}

interface IRules {
	[propName: string]: true | (handle(...args) => void);
}
```

Пример создания функции для формирования DOM-свойств на основе входных `props`.

```ts
import {createGenerator} from 'ibi';

// Исходный интерфейс
interface IInputProps {
	name: string;
	value: string;
	disabled?: boolean;
	onInput: (evt: Event) => void;
}

// Интерфейс результата
interface IInputDOMAttrs extends IInputProps {
	'aria-disabled': boolean;
}

// Создаём фабрику деклараций
const domAttrs = createDeclarationFactory<IInputDOMAttrs>(
	['attrs', 'srcProps', 'classNames', 'css'],
	(prop, value, attrs, srcProps) => { // обработка `true`
		(srcProps[prop] != null) && (attrs[prop] = srcProps[prop]);
	}
);

// Регистрируем функцию конвертации для `IInputProps`
const inputPropsToAttrs = domAttrs.register<IInputProps>('IInputProps', {
	name: true, // переносим as is
	value: true,
	disabled(prop, value, attrs, srcProps, classNames, css) {
		// В этом обработчике кроме `disabled`, определяем `aria-disabled`
		// и в `classNames` добавляем `css.isDisabled`.
		attrs[prop] = value;

		if (value) {
			attrs[`aria-${prop}`] = value + '';
			classNames.push(css.isDisabled);
		}
	},
	onInput(prop, value, attrs, srcProps) {
		// Добавляем слушатель только если не выставлен `disabled`
		attrs[prop] = srcProps.disabled ? null : value;
	},
});


// Где-то в коде, например реакт компоненте
import css from './Input.css';

export default function InputComponent(props: IInputProps) {
	const attrs = {};
	const classNames = [css.input]; // базовый класс

	inputPropsToAttrs(attrs, props, classNames, css);
	// или domAttrs.exec(['IInputProps'], attrs, props, classNames, css);
	// либо ещё лучше, если использовать `tx-reflector`:
	//   domAttrs.exec(getComponentInterfaces<IInputProps>(this), attrs, props, classNames, css);

	return <input {...attrs} className={classNames.join(' ')}/>;
}
```


### Регрессы
Лень писать пример, поэтому посмотрите [тесты](./src/regression/regression.tests.ts)

```ts
// ...
```


### Разработка

 - `npm i`
 - `npm test`


### Code coverage

 - [coverage/lcov-report/index.html](./coverage/lcov-report/index.html)
