export interface RegressionEnv {
	name: string;
}

export interface RegressionTest<T, D, E extends RegressionEnv> {
	initialData?: Partial<D>;
	initialTest?(target: T, data: Partial<D>, env?: E);
	data: Partial<D>;
	test(target: T, data: Partial<D>, env?: E);
}

export interface RegressionCases<T, D, E extends RegressionEnv> {
	[title: string]: RegressionTest<T, D, E>;
}

export class Regression<T, D, E extends RegressionEnv> {
	constructor(public name: string) {
	}

	protected factory(Class: T, data: D): T {
		return <T>{};
	}

	protected update(target: T, data: D) {
	}

	protected getEnv(target: T, data: Partial<D>): E {
		return <E>{
			name: this.name,
		};
	}

	protected getAll(): RegressionCases<T, D, E> {
		return {};
	}
}

const regressions: object = {};

export function registerRegression(name: string, Class: Function) {
	regressions[name] = Class;
}

export function runRegression(names: string[], Class: Function) {
	names.forEach(name => {
		describe(name, () => {
			if (!regressions[name]) {
				throw new Error(`${name} — not found`);
			}

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
						(desc.initialTest ? desc.initialTest : desc.test)(
							instance,
							data,
							regression.getEnv(instance, data),
						);
					});

					it('changes', () => {
						const data = desc.data || {};

						regression.update(instance, data);
						desc.test(
							instance,
							data,
							regression.getEnv(instance, data),
						);
					});
				});
			});
		});
	});
}
