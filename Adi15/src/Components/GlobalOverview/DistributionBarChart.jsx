import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Text } = Typography;

const DistributionBarChart = ({data}) => {
  return (
    <Card title="DISTRIBUTION" variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>

                        {/* ResponsiveContainer ensures the chart resizes with the user's screen */}
                        <div style={{ height: 250, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">

                                {/* 1. The Main Wrapper: Pass the data array here */}
                                {/* Make sure you imported Legend from 'recharts' at the top of your file! */}
                                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />

                                    {/* NEW: Adds a legend to the top of the chart */}
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

                                    {/* BAR 1: Line Coverage (Purple) */}
                                    <Bar
                                        dataKey="line_count"
                                        name="Line Coverage"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />

                                    {/* BAR 2: Branch Coverage (Light Blue) */}
                                    <Bar
                                        dataKey="branch_count"
                                        name="Branch Coverage"
                                        fill="#22c55e"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />

                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
  )
}

export default DistributionBarChart