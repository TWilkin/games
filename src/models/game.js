import { Model, DataTypes} from 'sequelize';

import { sequelize } from '../db'

export class Game extends Model {}
Game.init({
    game_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize
});
Game.sync();
