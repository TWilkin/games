import { VariableType } from 'json-to-graphql-query';
import React, { FormEvent, useEffect, useState } from 'react';

import { useQuery } from '../../hooks/graphql';
import { Game, IGDBGame } from '../../models';
import { APIProps } from '../common';
import SortableTable from '../SortableTable/SortableTable';

interface IGDBSearchFormProps extends APIProps {
    game?: Game;
    onGameSelect: (game: IGDBGame) => void;
}

interface SearchQuery {
    id?: number;
    name?: string;
}

const IGDBSearchForm = ({ api, game, onGameSelect }: IGDBSearchFormProps): JSX.Element => {
    const [ searchQuery, setSearchQuery ] = useState<SearchQuery>({
        id: game?.igdbId,
        name: undefined
    });

    const query = {
        query: {
            __variables: {
                id: 'Int',
                name: 'String'
            },
            GetIGDBGame: {
                __args: {
                    id: new VariableType('id'),
                    name: new VariableType('name')
                },
                id: true,
                name: true,
                url: true,
                platforms: {
                    platformId: true,
                    name: true
                }
            }
        }
    };
    const games = useQuery<IGDBGame>(api, query, searchQuery);

    useEffect(() => setSearchQuery({
        id: game?.igdbId,
        name: game?.igdbId ? undefined : game?.title
    }), [game]);

    const onSearchChange = (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        
        const value = event.currentTarget.value;
        if(value && value.length >= 3) {
            setSearchQuery({
                id: undefined,
                name: value
            });
        }
    };

    const onRadioSelect = (event: FormEvent<HTMLInputElement>) => {
        event.persist();

        const id = event.currentTarget.value 
            ? parseInt(event.currentTarget.value)
            : -1;
        const game = games.find(game => game.id === id);

        if(game) {
            onGameSelect(game);
        }
    };

    const renderCells = (igdbGame: IGDBGame) => {
        const platforms = igdbGame.platforms
            ?.sort((a, b) => a.name.localeCompare(b.name))
            ?.map(platform => platform.name)
            ?.join(', ');

        return [
            <input 
                key={'id'}
                type='radio'
                name='igdbId'
                value={igdbGame.id}
                defaultChecked={igdbGame.id === game?.igdbId}
                onChange={onRadioSelect} />,
            <a key='name' href={igdbGame.url} target='_blank' rel='noreferrer'>
                {igdbGame.name}
            </a>,
            <p key='platforms'>{platforms}</p>
        ];
    };
    
    return (
        <>
            <div className='field'>
                <div className='field__label'>
                    <label htmlFor='igdbSearch'>Game Search:</label>
                </div>
                <div className='field__input'>
                    <input
                        type='text'
                        name='gameNameSearch'
                        id='gameNameSearch'
                        defaultValue={game?.title}
                        onChange={onSearchChange} />
                </div>
            </div>

            {games?.length > 0 && (
                <SortableTable<IGDBGame> 
                    title='IGDB Seach Results'
                    headings={['', 'Name', 'Platforms']}
                    sortColumns={['id', 'name', 'platforms']}
                    defaultSortColumn='name'
                    data={games}
                    row={renderCells} />
            )}
        </>
    );
};

export default IGDBSearchForm;
