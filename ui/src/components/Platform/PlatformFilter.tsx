import React, { FormEvent } from 'react';

import { APIProps } from '../common';
import { queries } from '../../graphql';
import { Platform } from '../../models';
import { useQuery } from '../../hooks/graphql';

interface PlatformFilterProps extends APIProps {
    onSelect: (platformId: number) => void;
}

const PlatformFilter = ({ api, onSelect }: PlatformFilterProps): JSX.Element => {
    const platforms = useQuery<Platform>(api, queries['Platform']);

    const onChange = (event: FormEvent<HTMLSelectElement>) => {
        event.preventDefault();

        const platformId = parseInt(event.currentTarget.value);
        if(platformId != -1) {
            onSelect(platformId);
        }
    };

    return (
        <div>
            {platforms ? (
                <div className='field'>
                    <label htmlFor='platformFilterSelect' className='sr-only'>
                        Select platform
                    </label>
                    <div className="field__input">
                        <select onChange={onChange} defaultValue='-1'>
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
