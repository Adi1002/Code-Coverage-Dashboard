import React from 'react';
import { Row, Col, Card, Typography, Tag } from 'antd';

const { Text, Title } = Typography;

const SummaryCards = ({metrics}) => {
  return (
            <Row gutter={[16, 16]}>
                {metrics.map((metric) => (
                    // Span 6 out of 24 columns means exactly 4 cards fit in one row
                    <Col xs={24} sm={12} md={8} key={metric.id}>
                        <Card variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>

                            {/* Card Header (Title & Icon) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text type="secondary" style={{ fontWeight: 500 }}>{metric.title}</Text>
                                <div style={{
                                    backgroundColor: metric.iconBg,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex'
                                }}>
                                    {metric.icon}
                                </div>
                            </div>

                            {/* Card Body (Big Number & Tag) */}
                            <div style={{ marginTop: '16px' }}>
                                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>{metric.value}</Title>
                                <Tag color={metric.tagColor} style={{ borderRadius: '4px', margin: 0 }}>
                                    {metric.tagText}
                                </Tag>
                            </div>

                        </Card>
                    </Col>
                ))}
            </Row>
  )
}

export default SummaryCards