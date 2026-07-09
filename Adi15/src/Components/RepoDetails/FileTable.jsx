import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Breadcrumb, Row, Col, Card, Space, Tree, Input, Table, Progress, Badge, Tag } from 'antd';
import {
  DownloadOutlined, BellOutlined, BugOutlined, FolderOutlined, FileOutlined,
  FilterOutlined, WarningOutlined, ExportOutlined, CodeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
const { Title, Text } = Typography;
import { formatLineRanges } from '../../utils/calculations'


const FileTable = ({ fileCoverage, id, searchText, highlightedFile }) => {


  const UncoveredLinesCell = ({ record, repoId }) => {
    const [loading, setLoading] = useState(false);
    const [linesString, setLinesString] = useState(null);

    const fetchUncovered = async () => {
      setLoading(true);
      try {
        const safeFileName = encodeURIComponent(record.path);
        const response = await fetch(`https://13.127.42.153/codecoverage/dashboard/${repoId}/uncovered?filename=${safeFileName}`, { credentials: 'include' });

        // 2. The Mid-Session Expiration Check
        if (response.status === 401) {
          // If token expired, force them back to login instantly
          window.location.href = 'https://ec2-13-127-42-153.ap-south-1.compute.amazonaws.com/auth/login';
          return; // Stop running the rest of the code
        }

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        if (data.uncovered_count === 0) {
          setLinesString("100% Covered");
        } else {
          setLinesString(formatLineRanges(data.uncovered_lines));
        }
      } catch (error) {
        console.error("Error fetching uncovered lines:", error);
        setLinesString("Error loading");
      }
      setLoading(false);
    };

    // If we have the data, show the string. Otherwise, show the load button.
    if (linesString) {
      return (
        <Text style={{ color: linesString === "100% Covered" ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
          {linesString}
        </Text>
      );
    }

    return (
      <Button size="small" type="dashed" loading={loading} onClick={fetchUncovered}>
        Load Lines
      </Button>
    );
  };

  const fileColumns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <FileOutlined style={{ color: '#6b7280' }} />
            <Text style={{ fontWeight: 600, color: '#4f46e5' }}>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '11px' }}>{record.path}</Text>
        </Space>
      ),
    },
    {
      title: 'Line Coverage',
      dataIndex: 'lineCoverage',
      key: 'lineCoverage',
      sorter: (a, b) => a.lineCoverage - b.lineCoverage,

      render: (coverage) => {
        let strokeColor = '#22c55e'; // Green
        if (coverage < 50) strokeColor = '#ef4444'; // Red
        else if (coverage < 70) strokeColor = '#f59e0b'; // Orange
        else if (coverage < 80) strokeColor = '#eab308'; // Yellow

        return (
          <div style={{ width: '120px' }}>
            <Progress percent={coverage} size="small" strokeColor={strokeColor} />
          </div>
        );
      },
    },
    {
      title: 'Branch Coverage',
      dataIndex: 'branchCoverage',
      key: 'branchCoverage',
      sorter: (a, b) => a.lineCoverage - b.lineCoverage,

      render: (text) => <Text style={{ fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: 'Lines (C/V)',
      dataIndex: 'linesCV',
      key: 'linesCV',
    },
    {
      title: 'Uncovered Lines',
      key: 'uncoveredLines',
      render: (_, record) => <UncoveredLinesCell record={record} repoId={id} />,
    },
  ];

  return (
    <Card
      variant={false}
      style={{ borderRadius: '8px', minHeight: '300px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      {/* Header with Title and Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>File Level Coverage</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Listing {fileCoverage.length} files in <strong>{id}</strong>
          </Text>
        </div>
        <Space size="middle">
          <Badge color="#ef4444" text={<Text type="secondary" style={{ fontSize: '12px' }}>Danger (&lt;50%)</Text>} />
          <Badge color="#f59e0b" text={<Text type="secondary" style={{ fontSize: '12px' }}>Warning (50-70%)</Text>} />
          <Badge color="#eab308" text={<Text type="secondary" style={{ fontSize: '12px' }}>Caution (70-80%)</Text>} />
          <Badge color="#22c55e" text={<Text type="secondary" style={{ fontSize: '12px' }}>Good (&gt;80%)</Text>} />
        </Space>
      </div>

      {/* NEW: A quick CSS block to define our custom highlight color */}
      <style>{`
                .highlight-row > td {
                  background-color: #f0f0f2 !important; /* A soft indigo highlight */
                  transition: background-color 0.3s ease;
                }
              `}</style>

      <Table
        columns={fileColumns}

        // NEW: Filter the data dynamically!
        dataSource={fileCoverage.filter(file =>
          file.filename.toLowerCase().includes(searchText.toLowerCase())
        )}

        rowClassName={(record) => record.key === highlightedFile ? 'highlight-row' : ''}

        pagination={false}
        scroll={{ x: 700, y: 400 }}
      />
    </Card>
  )
}

export default FileTable