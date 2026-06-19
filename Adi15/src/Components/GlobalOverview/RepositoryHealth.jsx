import React from 'react';
import { Spin, Alert, message } from 'antd';
import { Typography, Button, Space, Row, Col, Card, Tag, Badge, Table, Progress } from 'antd';
import { Link } from 'react-router-dom';
import {ResponsiveContainer, LineChart, XAxis, YAxis, Line} from 'recharts';
const { Title, Text } = Typography;

const RepositoryHealth = ({data, globalSearch}) => {

    const columns = [
        {
            title: 'Repository',
            dataIndex: 'repository', // Looks for 'repository' in JSON
            key: 'repository',
            render: (text, record) => (
                <div>
                    {/* Wrap the name in a Link that points to the dynamic URL */}
                    <Link to={`/repository/${record.repository}`} style={{ fontWeight: 600, color: '#000005', textDecoration: 'none' }}>
                        {text}
                    </Link>
                    <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '0.5px', marginTop: '4px' }}>
                        {record.branch.toUpperCase()}
                    </div>
                </div>
            ),
        },
        {
            title: 'Line Coverage',
            dataIndex: 'lineCoverage',
            key: 'lineCoverage',
            align: 'center',
            sorter: (a, b) => a.lineCoverage - b.lineCoverage,
            render: (coverage) => {
                return <Progress type="circle" percent={coverage} size={40} strokeColor='#225bc5' />;
            },
        },
        {
            title: 'Trend',
            key: 'lineTrend',
            render: (_, record) => {
                // 1. Determine if the text is positive or negative to set the color dynamically
                const isPositive = !record.lineTrend.startsWith('-');
                const color = isPositive ? '#225bc5' : '#ef4444'; // Green or Red

                return (
                    <Space size="small">
                        {/* 2. Render the calculated text (+0.0%) */}
                        <Text style={{ color: color, fontWeight: 500 }}>{record.lineTrend}</Text>

                        {/* 3. The Recharts Sparkline Wrapper */}
                        <div style={{ width: 60, height: 25 }}>
                            <ResponsiveContainer width="100%" height="100%">

                                {/* Feed it the sorted history array! */}
                                <LineChart data={record.trendData}>
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Line
                                        type="monotone"
                                        dataKey="lineCoverage" // Tells it to plot the Line Coverage metric
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={false} // Removes the dots on the line
                                        isAnimationActive={false} // Prevents lag in large tables
                                    />
                                </LineChart>

                            </ResponsiveContainer>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: 'Branch Coverage',
            dataIndex: 'branchCoverage',
            key: 'branchCoverage',
            align: 'center',
            sorter: (a, b) => a.lineCoverage - b.lineCoverage,
            render: (coverage) => {
                return <Progress type="circle" percent={coverage} size={40} strokeColor='#22c55e' />;
            },
        },
        {
            title: 'Trend',
            key: 'branchTrend',
            render: (_, record) => {
                // 1. Determine if the text is positive or negative to set the color dynamically
                const isPositive = !record.branchTrend.startsWith('-');
                const color = isPositive ? '#22c55e' : '#ef4444'; // Green or Red

                return (
                    <Space size="small">
                        {/* 2. Render the calculated text (+0.0%) */}
                        <Text style={{ color: color, fontWeight: 500 }}>{record.branchTrend}</Text>

                        {/* 3. The Recharts Sparkline Wrapper */}
                        <div style={{ width: 60, height: 25 }}>
                            <ResponsiveContainer width="100%" height="100%">

                                {/* Feed it the sorted history array! */}
                                <LineChart data={record.trendData}>
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Line
                                        type="monotone"
                                        dataKey="branchCoverage" // Tells it to plot the Branch Coverage metric
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={false} // Removes the dots on the line
                                        isAnimationActive={false} // Prevents lag in large tables
                                    />
                                </LineChart>

                            </ResponsiveContainer>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: 'Last Run',
            dataIndex: 'lastRun',
            key: 'lastRun',
            // NEW: Sort by the raw timestamp number behind the scenes!
            sorter: (a, b) => a.lastRunEpoch - b.lastRunEpoch,
            // Ant Design lets you set a default sort order when the page loads!
            defaultSortOrder: 'descend',
            render: (text) => <Text type='secondary'>{text}</Text>,
        },
    ];

  return (
    <Card
                        variant={false}
                        style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', body: { padding: 0 } }}
                         // Removes default card padding so table touches the edges
                    >
                        {/* Table Header Row */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={4} style={{ margin: 0 }}>Repository Health</Title>
                        </div>

                        {/* The Actual Table Component */}
                        <Table
                            columns={columns}
                            // 2. Filter the tableData dynamically based on the search prop!
                            dataSource={data.filter(repo => {
                                // If the search is empty, this returns true for everything.
                                // Otherwise, it checks if the repository name includes the typed text.
                                const searchLower = (globalSearch || '').toLowerCase();
                                return repo.repository.toLowerCase().includes(searchLower);
                            })}
                            pagination={false} // Hides page numbers since your design shows all rows
                            scroll={{ x: 700, y: 400 }}
                            rowKey="id"        // Tells React to use the JSON 'id' as the unique loop key
                        />

                        {/* Table Footer */}
                        <div style={{ padding: '16px 24px', textAlign: 'center', background: '#fafafa', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>

                        </div>
                    </Card>
  )
}

export default RepositoryHealth