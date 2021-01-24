import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';

interface TimerProps {
    startTime: number
}

const Timer = ({ startTime }: TimerProps): JSX.Element => {
    const [ endTime, setEndTime ] = useState(Date.now());
    
    useEffect(
        () => {
            const timer = setInterval(() => setEndTime(Date.now()), 1000);

            return () => clearInterval(timer);
        },
        [startTime]
    );

    return (
        <Moment 
            duration={startTime} 
            date={endTime} 
            format='hh:mm:ss' />
    );
};

export default Timer;
