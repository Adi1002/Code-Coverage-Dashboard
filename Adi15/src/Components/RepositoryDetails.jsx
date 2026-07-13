import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Breadcrumb, Row, Col, Card, Space, Tree, Input, Table, Progress, Badge, Tag } from 'antd';
import {
  DownloadOutlined, BellOutlined, BugOutlined, FolderOutlined, FileOutlined,
  FilterOutlined, WarningOutlined, ExportOutlined, CodeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import SummaryCards from './RepoDetails/SummaryCards';
import FileTable from './RepoDetails/FileTable';
import RunHistory from './RepoDetails/RunHistory';
import {formatTrend, getColor, buildTreeData, getFirstBranchKeys, extractAllFiles} from '../utils/calculations'
const { Title, Text } = Typography;


const RepositoryDetails = () => {
  // Grab the repository name from the URL (e.g., "workflow-service")
  const { id } = useParams();

  // NEW: Initialize the navigate function
  const navigate = useNavigate();

  // 2. Set up State Variables to hold the backend data
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [fileCoverage, setFileCoverage] = useState([]);
  const [uncoveredDataCache, setUncoveredDataCache] = useState({});
  const [trendData, setTrendData] = useState([]);
  
  const [criticalGaps, setCriticalGaps] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [highlightedFile, setHighlightedFile] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
    
  // NEW: Auto-scroll to the highlighted file in the table
  useEffect(() => {
    if (highlightedFile) {
      // Find the Ant Design table row using its unique data-row-key attribute
      const rowElement = document.querySelector(`tr[data-row-key="${highlightedFile}"]`);

      if (rowElement) {
        // Smoothly scroll that specific row into the center of the table's scrollable box!
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedFile]); // This runs every time the user clicks a new file in the tree


  useEffect(() => {
    const fetchAllRepoData = async () => {
      try {
        setIsLoading(true);
        
        // 2. Fetch the working endpoints
        const [summaryRes, packagesRes] = await Promise.all([
          fetch(`https://13.127.42.153/codecoverage/dashboard/${id}/summary`, {credentials: 'include'}),
          fetch(`https://13.127.42.153/codecoverage/dashboard/${id}/packages`, {credentials: 'include'})
        ]);

        // 2. The Mid-Session Expiration Check
  if (summaryRes.status === 401 || packagesRes.status === 401) {
  window.location.href = 'https://100.24.9.250:8000/auth/login';
  return;
}

        if (!summaryRes.ok || !packagesRes.ok) {
          throw new Error("Failed to fetch one or more data endpoints");
        }

        const summaryData = await summaryRes.json();
        const packagesData = await packagesRes.json();

        // 3. MAP SUMMARY DATA
        const mappedMetrics = [
          {
            title: 'Line Coverage',
            value: `${summaryData.line_coverage}%`,
            trend: formatTrend(summaryData.line_coverage_trend),
            color: getColor(summaryData.line_coverage)
          },
          {
            title: 'Branch Coverage',
            value: `${summaryData.branch_coverage}%`,
            trend: formatTrend(summaryData.branch_coverage_trend),
            color: getColor(summaryData.branch_coverage)
          },
          {
            title: 'Lines Covered',
            value: `${summaryData.lines_covered} / ${summaryData.lines_valid}`,
            trend: '',
            color: '#111827'
          },
          {
            title: 'Branches Covered',
            value: `${summaryData.branches_covered} / ${summaryData.branches_valid}`,
            trend: '',
            color: '#111827'
          }
        ];

        const mappedTree = buildTreeData(packagesData.packages);
        const mappedFiles = extractAllFiles(packagesData.packages);

        // 4. CALCULATE CRITICAL GAPS dynamically!
        // We filter for files < 50%, sort them from lowest to highest, and grab the worst 5
        const calculatedGaps = mappedFiles
          .filter(file => file.lineCoverage < 50)
          .sort((a, b) => a.lineCoverage - b.lineCoverage)
          .slice(0, 5) // Only take the top 5 worst files
          .map(file => ({
            file: file.filename,
            coverage: `${file.lineCoverage}%`
          }));

        //Calculate the keys for the very first deep branch
        const initialExpandedKeys = getFirstBranchKeys(mappedTree);

        // 5. UPDATE STATE
        setMetrics(mappedMetrics);
        setTreeData(mappedTree);
        setFileCoverage(mappedFiles);
        setCriticalGaps(calculatedGaps);
        setExpandedKeys(initialExpandedKeys);
        setIsLoading(false);

      } catch (error) {
        console.error("Error fetching repository details:", error);
        setIsLoading(false);
      }
    };

    fetchAllRepoData();
  }, [id]);


  // 2. The Expanded Row UI (The Diagnostic Panel)
  const expandedRowRender = (record) => {
    // Grab the data for this specific file from our new cache state
    const data = uncoveredDataCache[record.key];

    // STATE 1: LOADING
    // If the data isn't in the cache yet, it means the API is still fetching it
    if (!data) {
      return (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <Text type="secondary">Fetching coverage diagnostics...</Text>
        </div>
      );
    }

    // STATE 2: 100% COVERED (Success)
    // If the API returns 0 uncovered lines, show a success message instead of the diagnostic panel!
    if (data.uncovered_count === 0) {
      return (
        <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Text style={{ color: '#166534', fontWeight: 600, fontSize: '16px' }}>
            🎉 100% Coverage! No missing lines in this file.
          </Text>
        </div>
      );
    }
  };

   return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* 1. BREADCRUMB & HEADER SECTION */}
      <div style={{ marginBottom: '32px' }}>

        {/* Top Row: Breadcrumb & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',  gap: '12px', marginBottom: '16px' }}>

          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate('/')}>Overview</a> },
              { title: id },
            ]}
          />

          {/* NEW: The Back Button! */}
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}>Back to Overview
          </Button>
        </div>

        {/* Bottom Row: Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>{id}</Title>
            <Text type="secondary">Repository Details for branch <strong>main</strong></Text>
          </div>
        </div>
      </div>

      <SummaryCards metrics={metrics} criticalGaps={criticalGaps} />

      {/* 3. MAIN CONTENT SPLIT (SIDEBAR + TABLES) */}
      <Row gutter={[24, 24]}>

        {/* Left Sidebar (Packages Tree) */}
        <Col xs={24} lg={6}>
          <Card variant={false} style={{ borderRadius: '8px', minHeight: '300px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>

            {/* 1. Search Bar */}
            <Input.Search
              placeholder="Find file or package..."
              style={{ marginBottom: '24px' }}

              // NEW: Update state on every keystroke
              onChange={(e) => setSearchText(e.target.value)}
              allowClear // Adds a little "x" to clear the search easily
            />

            {/* 2. Packages Tree Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>PACKAGES</Text>
            </div>

            {/* 3. The Interactive Tree */}
            <Tree
              showIcon
              // NEW: Use our dynamic state instead of defaultExpandAll
              expandedKeys={expandedKeys}
              onExpand={(newExpandedKeys) => setExpandedKeys(newExpandedKeys)}
              treeData={treeData}
              style={{ marginBottom: '32px' }}

              // NEW: The magic connection!
              onSelect={(selectedKeys, { node }) => {
                // Check if they clicked a file (leaf) or a folder
                if (node.isLeaf) {

                  setHighlightedFile(node.key); // Marks the row for highlighting
                } else {
                  // If they click a folder, clear the filters
                  setSearchText('');
                  setHighlightedFile(null);
                }
              }}
            />
          </Card>
        </Col>

        {/* Right Main Content (File Table & History Table) */}
        <Col xs={24} lg={18}>
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>

            <FileTable fileCoverage={fileCoverage} id={id} searchText={searchText} highlightedFile={highlightedFile} />

            <RunHistory id={id} />

          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default RepositoryDetails;