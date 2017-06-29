import {runRegression, registerRegression, Regression, RegressionEnv} from './regression';

interface IBoxProps {
	width: number;
	height: number;
}

class Box {
	constructor(public size: IBoxProps) {
	}

	setSize(size: IBoxProps) {
		this.size = size;
	}
}

interface IRBoxEnv extends RegressionEnv {
}

class RBox extends Regression<Box, IBoxProps, IRBoxEnv> {
	static log: any = {};

	// Фабрика для создания тестируемого объекта
	factory(Class, size) {
		return new Class(size);
	}

	// Метод обновления свойств тестируемого объекта
	update(box, size) {
		box.setSize(size);
	}

	// Получение списка регрессионых тестов
	getAll() {
		return {
			// Название теста / describe(...)
			'width & height': {
				// Данные для инициализации и тест
				initialData: {width: 1, height: 2},
				initialTest(box, data) {
					RBox.log.initialTest = {data, size: box.size};
				},

				// Новые данные и тест на их изменение
				data: {width: 3},
				test(box, data) {
					RBox.log.test = {data, size: box.size};
				}
			}
		};
	}
}

describe('IBox', () => {
	registerRegression('IBox', RBox);
	runRegression(['IBox'], Box);

	it('results', () => {
		expect(RBox.log.initialTest.data).toEqual(RBox.log.initialTest.size);
		expect(RBox.log.test.data.width).toEqual(RBox.log.test.size.width);
	});
});
