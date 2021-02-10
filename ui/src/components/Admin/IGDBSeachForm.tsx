import { VariableType } from 'json-to-graphql-query';
import React, { FormEvent, useState } from 'react';

import { useQuery } from '../../hooks/graphql';
import { IGDBGame } from '../../models';
import { APIProps } from '../common';
import SortableTable from '../SortableTable/SortableTable';

const IGDBSearchForm = ({ api }: APIProps): JSX.Element => {
    const [ searchQuery, setSearchQuery ] = useState('');

    const query = {
        query: {
            __variables: {
                name: 'String'
            },
            GetIGDBGame: {
                __args: {
                    name: new VariableType('name')
                },
                id: true,
                name: true,
                url: true
            }
        }
    };
    const args = { name: searchQuery };
    const games = useQuery<IGDBGame>(api, query, args);

    const onSearchChange = (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();

        const value = event.currentTarget.value;
        if(value && value.length >= 3) {
            setSearchQuery(value);
        }
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
                        onChange={onSearchChange} />
                </div>
            </div>

            <SortableTable<IGDBGame> 
                title='IGDB Seach Results'
                headings={['', 'Name']}
                sortColumns={['id', 'name']}
                data={games}
                row={(game: IGDBGame) => 
                    [
                        <p key='id'>.</p>,
                        <a key='name' href={game.url} target='_blank' rel='noreferrer'>
                            {game.name}
                        </a>
                    ]
                } />
        </>
    );
};

export default IGDBSearchForm;
