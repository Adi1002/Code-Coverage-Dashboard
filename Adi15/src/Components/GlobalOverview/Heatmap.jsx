import React from 'react';
import { Spin, Alert, message } from 'antd';
import { Typography, Button, Space, Row, Col, Card, Tag, Badge, Table, Progress } from 'antd';
import { Link } from 'react-router-dom';
import {ResponsiveContainer, LineChart, XAxis, YAxis, Line, Treemap} from 'recharts';
const { Title, Text } = Typography;

const Heatmap = ({data}) => {


    // Add this right below your timeAgo helper function, OUTSIDE the main component
const CustomTreemapBox = (props) => {
    const { x, y, width, height, coverage, name } = props;

    // 1. Determine color based on your exact thresholds
    let fillColor = '#22c55e'; // Default to Green (>80%)
    if (coverage < 50) fillColor = '#ef4444'; // Danger Red
    else if (coverage < 70) fillColor = '#f59e0b'; // Warning Orange
    else if (coverage < 80) fillColor = '#eab308'; // Caution Yellow

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: fillColor,
                    stroke: '#ffffff', // Adds a clean white border between the boxes
                    strokeWidth: 2,
                }}
            />
            {/* Optional: Adds the repository name inside the box if it's large enough! */}
            {width > 50 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={500}>
                    {name.split('-')[0]} {/* Just shows the first word of the repo name to save space */}
                </text>
            )}
        </g>
    );
};

  return (
    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <Title level={4} style={{ margin: 0, marginRight: '12px' }}>System Hotspots</Title>
                        </div>

                        <Card variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                <Text type="secondary" style={{ fontWeight: 500 }}>COVERAGE TREEMAP (SIZE = LOC)</Text>
                                <Space>
                                    <Badge color="#ef4444" text={<Text type="secondary" style={{ fontSize: '12px' }}>0-50%</Text>} />
                                    <Badge color="#f59e0b" text={<Text type="secondary" style={{ fontSize: '12px' }}>50-80%</Text>} />
                                    <Badge color="#22c55e" text={<Text type="secondary" style={{ fontSize: '12px' }}>80%+</Text>} />
                                </Space>
                            </div>

                            <div style={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <Treemap
                                        data={data}
                                        dataKey="size"
                                        aspectRatio={4 / 3}
                                        stroke="#fff"
                                        content={<CustomTreemapBox />}
                                    />
                                </ResponsiveContainer>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                                    * Larger boxes represent modules with higher Line Counts. Color indicates current coverage percentage.
                                </Text>
                            </div>
                        </Card>
                    </div>
  )
}

export default Heatmap