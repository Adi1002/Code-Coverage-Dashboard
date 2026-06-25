import React from 'react';
import { Card, Typography } from 'antd';
import { ComposedChart, Bar, Line, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Text } = Typography;

const DistributionBarChart = ({ data }) => {
    return (
        <Card title="DISTRIBUTION" variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>

            {/* ResponsiveContainer ensures the chart resizes with the user's screen */}
            <div style={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">

                    

                    {/* NEW: Use ComposedChart instead of BarChart */}
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />

                        {/* Metric 1: Line Coverage stays as a solid Bar */}
                        <Line
                            type="monotone"
                            dataKey="line_count"
                            name="Line Coverage"
                            stroke="#6366f1"
                            strokeWidth={3}
                            //dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                            dot = {false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Metric 2: Branch Coverage becomes a smooth Line floating over the bars! */}
                        <Line
                            type="monotone"
                            dataKey="branch_count"
                            name="Branch Coverage"
                            stroke="#22c55e"
                            strokeWidth={3}
                            //dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                            dot = {false}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}

export default DistributionBarChart