import { Model, DataTypes} from 'sequelize';

import { sequelize } from '../db'

class Game extends Model {}
Game.init({
    gameId: { 
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
