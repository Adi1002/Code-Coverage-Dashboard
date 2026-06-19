import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Breadcrumb, Row, Col, Card, Space, Tree, Input, Table, Progress, Badge, Tag } from 'antd';
import {
  DownloadOutlined, BellOutlined, BugOutlined, FolderOutlined, FileOutlined,
  FilterOutlined, WarningOutlined, ExportOutlined, CodeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const { Title, Text } = Typography;

const SummaryCards = ({metrics, criticalGaps}) => {
  return (
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} md={8} md={{ flex: '0 0 20%', maxWidth: '20%' }} // Laptops
          lg={{ flex: '0 0 20%', maxWidth: '20%' }} // Desktops
          xl={{ flex: '0 0 20%', maxWidth: '20%' }} // Large Monitors
          key={index}>
            <Card variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{metric.title}</Text>
                {metric.trend && (
                  <Text style={{ color: metric.trend.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                    {metric.trend.startsWith('+') ? `↗ ${metric.trend}` : `↘ ${metric.trend}`}
                  </Text>
                )}
              </div>
              <Title level={2} style={{ margin: '8px 0', color: metric.color }}>{metric.value}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>{metric.note}</Text>
            </Card>
          </Col>
        ))}

        {/* NEW: The 5th Card for Critical Gaps */}
        <Col xs={24} sm={12} md={8}
        md={{ flex: '0 0 20%', maxWidth: '20%' }} // Laptops
          lg={{ flex: '0 0 20%', maxWidth: '20%' }} // Desktops
          xl={{ flex: '0 0 20%', maxWidth: '20%' }} // Large Monitors
        >
          <Card variant={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <WarningOutlined style={{ color: '#ef4444', marginRight: '8px' }} />
              <Text style={{ fontWeight: 600, fontSize: '14px' }}>Critical Gaps</Text>
            </div>

            {/* Scrollable container so it matches the height of the other cards */}
            <div style={{ overflowY: 'auto', maxHeight: '70px', paddingRight: '4px' }}>
              <Space orientation="vertical" size={2} style={{ width: '100%' }}>
                {criticalGaps.length > 0 ? (
                  criticalGaps.map((gap, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }} ellipsis={true}>{gap.file}</Text>
                      <Text style={{ color: '#ef4444', fontWeight: 600, fontSize: '12px', paddingLeft: '8px' }}>{gap.coverage}</Text>
                    </div>
                  ))
                ) : (
                  <Text type="secondary" style={{ fontSize: '12px' }}>No critical gaps</Text>
                )}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
  )
}

export default SummaryCards