import { sequelizeMockingMocha } from 'sequelize-mocking';

import { sequelize } from '../src/db';

describe('API', () => {

    Object.values(sequelize.models).forEach((model) => {
        describe(model.name, () => {
            sequelizeMockingMocha(
                sequelize,
                `${__dirname}/data/${model.name}.json`,
                { logging: false }
            );

            it('GET no parameter', async () => {
                const data = await model.findAll();
                console.log(data);
            });

            it('GET with id', async () => {
                const data = await model.findAll({
                    where: {
                        gameId: 1
                    }
                });
                console.log(data);
            });
        });
    });

});
