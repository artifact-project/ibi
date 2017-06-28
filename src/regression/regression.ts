export interface IRegressionEnv {
	name: string;
}

export interface IRegression<T, D, E extends IRegressionEnv> {
	initialData?: Partial<D>;
	initialTest?(target: T, data: Partial<D>, env?: E);
	data: Partial<D>;
	test(target: T, data: Partial<D>, env?: E);
}

export interface RegressionTests<T, D, E extends IRegressionEnv> {
	[title: string]: IRegression<T, D, E>;
}

export class Regression<T, D, E extends IRegressionEnv> {
	constructor(public name: string) {
	}

	protected factory(Class: T, data: D): T {
		return <T>{};
	}

	protected update(target: T, data: D) {
	}

	protected getEnv(data: Partial<D>): E {
		return <E>{
			name: this.name,
		};
	}

	protected getAll(): RegressionTests<T, D, E> {
		return {};
	}
}

const regressions: object = {};

export function registerRegression(name: string, Class: Function) {
	regressions[name] = Class;
}

export function runRegression(names: string[], Class: Function) {
	names.forEach(name => {
		const Regression = regressions[name];
		const regression = new Regression(name);
		const testCases = regression.getAll();

		Object.keys(testCases).forEach(title => {
			describe(title, () => {
				const desc = testCases[title];
				let instance;

				it('initial', () => {
					const data = desc.initialData || {};

					instance = regression.factory(Class, data);
					(desc.initialTest ? desc.initialTest : desc.test)(instance, data);
				});

				it('changes', () => {
					const data = desc.data || {};

					regression.update(instance, data);
					desc.test(instance, data);
				});
			});
		});
	});
}
