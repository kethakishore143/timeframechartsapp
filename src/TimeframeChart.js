import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';
import axios from 'axios';
import { format, parseISO, startOfWeek, startOfMonth, } from 'date-fns';


import "../App.css"

const TimeframeChart = () => {
    const [data, setData] = useState([]);
    const [timeframe, setTimeframe] = useState('daily');

    useEffect(() => {

        axios.get('/data.json')
            .then(response => {
                setData(response.data);
            })
            .catch(error => console.log(error));
    }, []);

    const filterDataByTimeframe = (data, timeframe) => {
        switch (timeframe) {
            case 'weekly':
                return data.reduce((acc, current) => {
                    const weekStart = format(startOfWeek(parseISO(current.timestamp)), 'yyyy-MM-dd');
                    const existingWeek = acc.find(d => d.timestamp === weekStart);
                    if (existingWeek) {
                        existingWeek.value += current.value;
                    } else {
                        acc.push({ timestamp: weekStart, value: current.value });
                    }
                    return acc;
                }, []);
            case 'monthly':
                return data.reduce((acc, current) => {
                    const monthStart = format(startOfMonth(parseISO(current.timestamp)), 'yyyy-MM-dd');
                    const existingMonth = acc.find(d => d.timestamp === monthStart);
                    if (existingMonth) {
                        existingMonth.value += current.value;
                    } else {
                        acc.push({ timestamp: monthStart, value: current.value });
                    }
                    return acc;
                }, []);
            case 'daily':
            default:
                return data;
        }
    };

    const handlePointClick = (data) => {
        alert(`Clicked data point: ${JSON.stringify(data)}`);
    };

    const filteredData = filterDataByTimeframe(data, timeframe);

    return (
        <div className='chart-container'>
            <div className='chart-buttons'>
                <button onClick={() => setTimeframe('daily')} >Daily</button>
                <button onClick={() => setTimeframe('weekly')}>Weekly</button>
                <button onClick={() => setTimeframe('monthly')}>Monthly</button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={filteredData}
                    onClick={(e) => {
                        if (e && e.activePayload) {
                            handlePointClick(e.activePayload[0].payload);
                        }
                    }} className='chart-wrapper'
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(tick) => format(parseISO(tick), 'MMM d, yyyy')} />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')} className="recharts-default-tooltip" />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div >
    );
};

export default TimeframeChart;

