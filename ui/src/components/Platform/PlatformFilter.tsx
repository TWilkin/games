import React, { FormEvent } from 'react';

import { APIProps } from '../common';
import { Platform } from '../../models';
import { useQuery } from '../../hooks/graphql';

interface PlatformFilterProps extends APIProps {
    multi?: boolean;
    onSelect: (platforms: Platform[]) => void;
}

const PlatformFilter = ({ api, multi, onSelect }: PlatformFilterProps): JSX.Element => {
    const query = {
        query: {
            GetPlatform: {
                platformId: true,
                name: true
            }
        }
    };

    const platforms = useQuery<Platform>(api, query);

    const onChange = (event: FormEvent<HTMLSelectElement>) => {
        event.preventDefault();

        const values = Array.from(event.currentTarget.selectedOptions, option => option.value)
            .map(value => parseInt(value));

        const selected = platforms.filter(platform => values.includes(platform.platformId));

        if(selected?.length >= 0) {
            onSelect(selected);
        }
    };

    const defaultValue = multi ? ['-1'] : '-1';

    return (
        <div>
            {platforms ? (
                <div className='field'>
                    <label htmlFor='platformFilterSelect' className='sr-only'>
                        Select platform
                    </label>
                    <div className="field__input">
                        <select onChange={onChange} defaultValue={defaultValue} multiple={multi}>
                            <option key='-1' value='-1'>-</option>
                            {platforms.map(entry => 
                                <option key={entry.platformId} value={entry.platformId}>{entry.name}</option>
                            )}
                        </select>
                    </div>
                </div>
            ) : (
                <p>No platforms found</p>
            )}
        </div>
    );
};

export default PlatformFilter;
