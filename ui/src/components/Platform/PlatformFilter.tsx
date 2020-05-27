import React, { Component, FormEvent } from 'react';

import { APIProps } from '../common';
import query, { queries } from '../../graphql';
import { Platform } from '../../models';

interface PlatformFilterProps extends APIProps {
    onSelect: (platform: Platform) => void;
}

interface PlatformFilterState {
    platforms?: Platform[];
}

export default class PlatformFilter extends Component<PlatformFilterProps, PlatformFilterState> {
    
    constructor(props: PlatformFilterProps) {
        super(props);

        this.state = {
            platforms: undefined
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(event: FormEvent<HTMLSelectElement>) {
        event.preventDefault();

        const platformId = parseInt(event.currentTarget.value);
        if(platformId != -1) {
            const platform = this.state.platforms
                    .find(platform => platform.platformId == platformId);
            this.props.onSelect(platform);
        }
    }

    public async componentDidMount() {
        try {
            const data: Platform[] = await query(this.props.api.url, queries['Platform']);
            this.setState({
                platforms: data
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    public render() {
        return (
            <div className='platforms'>
                {this.renderPlatforms()}
            </div>
        )
    }

    private renderPlatforms() {
        if(this.state.platforms) {
            return(
                <select onChange={this.onChange} defaultValue='-1'>
                    <option key='-1' value='-1'>-</option>
                    {this.state.platforms.map(entry => {
                        return(
                            <option key={entry.platformId} value={entry.platformId}>{entry.name}</option>
                        );
                    })}
                </select>
            );
        }

        return (
            <div>No platforms found</div>
        )
    }

};
