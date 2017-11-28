import {createDeclarationFactory, createMockFactory} from './code';
import {getRawInterfaces} from 'tx-reflector';

describe('IBox', () => {
	interface IBoxProps {
		color?: string;
		size: number;
		disabled: boolean;
	}

	interface IBoxAttrs {
		color: string;
		size: string;
		disabled: boolean;
	}

	const declarations = createDeclarationFactory<IBoxAttrs>(
		['attrs', 'srcProps'],
		(prop, value, attrs, srcProps) => {
			(srcProps[prop] != null) && (attrs[prop] = srcProps[prop]);
		}
	);

	const boxTx = declarations.create<IBoxProps>('IBox', {
		disabled: true,
		size(prop, value, attrs) {
			attrs[prop] = `${value}px`;
		},
		color(prop, value, attrs, srcProps) {
			attrs[prop] = <string>(srcProps.disabled ? '#ccc' : value);
		}
	});

	it('source', () => {
		expect(boxTx.toString()).toMatchSnapshot();
	});

	it('execute', () => {
		expect(boxTx({}, {
			size: 123,
			disabled: true,
		})).toEqual({
			color: '#ccc',
			size: '123px',
			disabled: true,
		});
	});
});

describe('IBtn', () => {
	interface IBtnProps {
		value: string;
		disabled?: boolean;
	}

	interface IBtnAttrs {
		value: string;
		disabled: boolean;
	}

	const declarations = createDeclarationFactory<IBtnAttrs>(
		['attrs', 'srcProps', 'classNames'],
		(prop, value, attrs, srcProps) => {
			(srcProps[prop] != null) && (attrs[prop] = srcProps[prop]);
		}
	);

	const btnTx = declarations.create<IBtnProps>('IBox', {
		value: true,
		disabled(prop, value, attrs, srcProps, classNames: string[]) {
			attrs[prop] = !!value;
			value && classNames.push(prop);

			if (value) {
				attrs[`aria-${prop}`] = value.toString();
			}
		},
	});

	it('source', () => {
		expect(btnTx.toString()).toMatchSnapshot();
	});

	it('disabled: false', () => {
		const classNames = [];

		expect(btnTx({}, {value: 'Wow!'}, classNames)).toEqual({value: 'Wow!', disabled: false});
		expect(classNames).toEqual([]);
	});

	it('disabled: true', () => {
		const classNames = [];

		expect(btnTx({}, {value: 'Wow!', disabled: true}, classNames)).toEqual({
			value: 'Wow!',
			disabled: true,
			'aria-disabled': 'true',
		});
		expect(classNames).toEqual(['disabled']);
	});
});

it('exec', () => {
	interface IElem {
		tabIndex?: number;
	}

	interface IComponent {
		disabled?: boolean;
	}

	interface IAttr extends IElem, IComponent {
	}

	const declarations = createDeclarationFactory<IAttr>(
		['attrs', 'srcProps'],
		(prop, value, attrs, srcProps) => {
			(srcProps[prop] != null) && (attrs[prop] = srcProps[prop]);
		}
	);

	const elemTx = declarations.create<IElem>('IElem', {
		tabIndex: true,
	});

	const cmpTx = declarations.create<IComponent>('IComponent', {
		disabled: true,
	});

	expect(elemTx.toString()).toMatchSnapshot();
	expect(cmpTx.toString()).toMatchSnapshot();

	const props = {
		tabIndex: 123,
		disabled: false,
	};
	expect(declarations.exec(['IElem', 'IComponent'], {}, props)).toEqual(props);
});

it('mock', () => {
	interface IProps {
		type: string;
		created: Date;
	}

	const mock = createMockFactory<IProps>({
		interfaces: getRawInterfaces<IProps>(),
		propFactory: (entry, parent) => entry.name === 'created' ? '2017-01-02' : parent(entry),
	});

	expect(mock()).toEqual({
		type: '',
		created: '2017-01-02',
	});

	expect(mock({type: 'text'})).toEqual({
		type: 'text',
		created: '2017-01-02',
	});
});
