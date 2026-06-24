import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Breadcrumb, Row, Col, Card, Space, Tree, Input, Table, Progress, Badge, Tag } from 'antd';
import {
  DownloadOutlined, BellOutlined, BugOutlined, FolderOutlined, FileOutlined,
  FilterOutlined, WarningOutlined, ExportOutlined, CodeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
const { Title, Text } = Typography;
import {formatLineRanges} from '../../utils/calculations'

const RunHistory = ({ id }) => {

  const [runHistory, setRunHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // NEW: Fetch and Process the Run History Data
  useEffect(() => {
    const fetchRunHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const response = await fetch('/api/repository');
        if (!response.ok) throw new Error("Failed to fetch run history");

        const allData = await response.json();

        // This 'id' now perfectly refers to the prop passed into the component
        const repoData = allData.filter(item => item.repoName === id);

        repoData.sort((a, b) => b.timestamp - a.timestamp);

        const formattedHistory = repoData.map((run, index) => {
          // ... your existing math and formatting logic stays exactly the same ...
          const lineCov = ((run['lines-covered'] / run['total-lines']) * 100).toFixed(1);
          const branchCov = ((run['branches-covered'] / run['total-branches']) * 100).toFixed(1);

          let changeStr_line = "-";
          if (index < repoData.length - 1) {
            const prevRun = repoData[index + 1];
            const prevLineCov = ((prevRun['lines-covered'] / prevRun['total-lines']) * 100).toFixed(1);
            const diff = (lineCov - prevLineCov).toFixed(1);
            changeStr_line = diff > 0 ? `+${diff}%` : `${diff}%`;
          }

          let changeStr_branch = "-";
          if (index < repoData.length - 1) {
            const prevRun = repoData[index + 1];
            const prevBranchCov = ((prevRun['branches-covered'] / prevRun['total-branches']) * 100).toFixed(1);
            const diff = (branchCov - prevBranchCov).toFixed(1);
            changeStr_branch = diff > 0 ? `+${diff}%` : `${diff}%`;
          }

          const dateObj = new Date(run.timestamp);
          const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

          return {
            key: run.timestamp.toString(),
            date: formattedDate,
            lineCoverage: `${lineCov}%`,
            branchCoverage: `${branchCov}%`,
            change_line: changeStr_line,
            change_branch: changeStr_branch
          };
        });

        setRunHistory(formattedHistory);
      } catch (error) {
        console.error("Error fetching run history:", error);
      }
      setIsHistoryLoading(false);
    };

    // Call the function INSIDE the useEffect
    // We add 'id' to the dependency array so it refetches if the user navigates to a new repo!
    if (id) {
      fetchRunHistory();
    }
  }, [id]);

  //Column Definitions for the Run History Table
  const historyColumns = [
    {
      title: 'DATE & TIME',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'LINE COVERAGE',
      dataIndex: 'lineCoverage',
      key: 'lineCoverage',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'CHANGE',
      dataIndex: 'change_line',
      key: 'change_line',
      render: (text) => {
        let color = '#6b7280'; // Default to Grey

        if (text.startsWith('+')) color = '#22c55e'; // Green
        else if (text.startsWith('-') && text !== '-') color = '#ef4444'; // Red

        return <Text style={{ color: color, fontWeight: 500 }}>{text}</Text>;
      },
    },
    {
      title: 'BRANCH COVERAGE',
      dataIndex: 'branchCoverage',
      key: 'branchCoverage',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'CHANGE',
      dataIndex: 'change_branch',
      key: 'change_branch',
      render: (text) => {
        let color = '#6b7280'; // Default to Grey

        if (text.startsWith('+')) color = '#22c55e'; // Green
        else if (text.startsWith('-') && text !== '-') color = '#ef4444'; // Red

        return <Text style={{ color: color, fontWeight: 500 }}>{text}</Text>;
      },
    },
  ];

  return (
    <Card
      variant={false}
      style={{ borderRadius: '8px', minHeight: '250px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Run History</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Historical performance for this repository and branch</Text>
        </div>
      </div>

      <Table
        columns={historyColumns}
        // UPDATE: Use the dynamic state and loading spinner!
        dataSource={runHistory}
        loading={isHistoryLoading}
        pagination={false}
        scroll={{ x: 650 }}
      />
    </Card>
  )
}

export default RunHistory