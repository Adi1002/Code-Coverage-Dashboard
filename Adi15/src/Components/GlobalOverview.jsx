import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { Link } from 'react-router-dom';
import { Typography, Button, Space, Row, Col, Card, Tag, Badge, Table, Progress } from 'antd';
import {
    DownloadOutlined, ShareAltOutlined, AppstoreOutlined, AimOutlined, LineChartOutlined, WarningOutlined, ArrowUpOutlined, ArrowDownOutlined, FilterOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart, Treemap, Legend } from 'recharts';
import { logger } from '../utils/logger';
import SummaryCards from './GlobalOverview/SummaryCards';
import DistributionBarChart from './GlobalOverview/DistributionBarChart';
import RepositoryHealth from './GlobalOverview/RepositoryHealth';
import Heatmap from './GlobalOverview/Heatmap';

const { Title, Text } = Typography;


const GlobalOverview = ({ globalSearch }) => {

    // State for the Global Summary Cards
    const [globalAvgLineCoverage, setGlobalAvgLineCoverage] = useState(0);
    const [globalAvgBranchCoverage, setGlobalAvgBranchCoverage] = useState(0);
    const [totalReposCount, setTotalReposCount] = useState(0);
    const [distributionData, setDistributionData] = useState([]);
    const [treemapData, setTreemapData] = useState([]); 

    // State for the Repository Health Table
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    let count_50_line = 0;
    let count_75_line = 0;
    let count_90_line = 0;
    let count_100_line = 0;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('https://100.24.9.250:8000/data/repository', {credentials: 'include'});

                // 2. The Mid-Session Expiration Check
  if (response.status === 401) {
    // If token expired, force them back to login instantly
    window.location.href = '/login'; 
    return; // Stop running the rest of the code
  }

                if (!response.ok) {
          // Throwing an error here triggers the catch block below
          throw new Error(`HTTP Status: ${response.status}`); 
        }
        
                const rawData = await response.json();

                // 2. GROUP DATA FOR THE TABLE
                const groupedData = {};

                rawData.forEach(item => {
                    const id = item.service_id;

                    // STEP 1: ONLY initialize the object (and empty history array) the very first time we see the repo
                    if (!groupedData[id]) {
                        groupedData[id] = {
                            id: id,
                            repository: item.repoName,
                            latestTotalLines: 0,
                            latestCoveredLines: 0,
                            latestTotalBranches: 0,
                            latestCoveredBranches: 0,
                            lastRunEpoch: 0,
                            history: []
                        };
                    }

                    // STEP 2: ALWAYS calculate this specific run's coverage and push it into the history
                    const lineRunCoverage = parseFloat(((item['lines-covered'] / item['total-lines']) * 100).toFixed(1));
                    const branchRunCoverage = parseFloat(((item['branches-covered'] / item['total-branches']) * 100).toFixed(1));

                    groupedData[id].history.push({
                        timestamp: item.timestamp,
                        lineCoverage: lineRunCoverage,
                        branchCoverage: branchRunCoverage
                    });

                    // STEP 3: SEPARATELY check if this run is the newest one to update our "latest" table stats
                    if (item.timestamp > groupedData[id].lastRunEpoch) {
                        groupedData[id].latestTotalLines = item['total-lines'];
                        groupedData[id].latestCoveredLines = item['lines-covered'];
                        groupedData[id].latestTotalBranches = item['total-branches'];
                        groupedData[id].latestCoveredBranches = item['branches-covered'];
                        groupedData[id].lastRunEpoch = item.timestamp;
                    }
                });

                // 2. CALCULATE GLOBAL AVERAGES (LATEST RUNS ONLY)
                let totalLinesGlobal = 0;
                let coveredLinesGlobal = 0;
                let totalBranchesGlobal = 0;
                let coveredBranchesGlobal = 0;

                // We loop over our filtered groupedData instead of the raw API data!
                Object.values(groupedData).forEach(service => {
                    totalLinesGlobal += service.latestTotalLines;
                    coveredLinesGlobal += service.latestCoveredLines;
                    totalBranchesGlobal += service.latestTotalBranches;
                    coveredBranchesGlobal += service.latestCoveredBranches;
                });

                // Calculate and set Line Coverage
                const globalLineAvg = ((coveredLinesGlobal / totalLinesGlobal) * 100).toFixed(1);
                setGlobalAvgLineCoverage(globalLineAvg);

                // Calculate and set Branch Coverage
                const globalBranchAvg = ((coveredBranchesGlobal / totalBranchesGlobal) * 100).toFixed(1);
                setGlobalAvgBranchCoverage(globalBranchAvg);

                const finalTableArray = Object.values(groupedData).map(service => {

                    
                    const sortedHistory = [...service.history].sort((a, b) => {
                        return Number(a.timestamp) - Number(b.timestamp);
                    });

                    // FIX: Log the sorted variable, not the raw one!
                    console.log(`SORTED History for ${service.repository}:`, sortedHistory);

                    
                    let lineTrendText = "+0.0%";
                    if (sortedHistory.length > 1) {
                        const latestLine = sortedHistory[sortedHistory.length - 1].lineCoverage;
                        const prevLine = sortedHistory[sortedHistory.length - 2].lineCoverage;
                        const oldestLine = sortedHistory[0].lineCoverage;

                        const lineDiff = (latestLine - oldestLine).toFixed(1);
                        lineTrendText = lineDiff >= 0 ? `+${lineDiff}%` : `-${lineDiff}%`;
                    }
                    


                    
                    let branchTrendText = "+0.0%";
                    if (sortedHistory.length > 1) {
                        const latestBranch = sortedHistory[sortedHistory.length - 1].branchCoverage;
                        const prevBranch = sortedHistory[sortedHistory.length - 2].branchCoverage;
                        const oldestBranch = sortedHistory[0].branchCoverage;
                        const branchDiff = (latestBranch - oldestBranch).toFixed(1);
                        branchTrendText = branchDiff >= 0 ? `+${branchDiff}%` : `-${branchDiff}%`;
                    }
                    return {
                        ...service,
                        // Calculate Line Coverage using ONLY the latest numbers
                        lineCoverage: parseFloat(((service.latestCoveredLines / service.latestTotalLines) * 100).toFixed(1)),

                        // Calculate Branch Coverage using ONLY the latest numbers
                        branchCoverage: parseFloat(((service.latestCoveredBranches / service.latestTotalBranches) * 100).toFixed(1)),

                        lineTrend: lineTrendText, 
                        branchTrend: branchTrendText,
                        trendData: sortedHistory,
                        branch: "MAIN BRANCH",
                        lastRun: new Date(service.lastRunEpoch).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })
                    };

                });


                // 4. CALCULATE BAR CHART DISTRIBUTION
                let bucket1 = [0, 0]; // 0-50%
                let bucket2 = [0, 0]; // 50-75%
                let bucket3 = [0, 0]; // 75-90%
                let bucket4 = [0, 0]; // 90-100%

                // Loop through the unique repositories we just formatted
                finalTableArray.forEach(repo => {
                    const coverage_line = repo.lineCoverage;
                    const coverage_branch = repo.branchCoverage;

                    if (coverage_line <= 50) {
                        bucket1[0]++;
                    } else if (coverage_line <= 75) {
                        bucket2[0]++;
                    } else if (coverage_line <= 90) {
                        bucket3[0]++;
                    } else {
                        bucket4[0]++;
                    }

                    if (coverage_branch <= 50) {
                        bucket1[1]++;
                    } else if (coverage_branch <= 75) {
                        bucket2[1]++;
                    } else if (coverage_branch <= 90) {
                        bucket3[1]++;
                    } else {
                        bucket4[1]++;
                    }
                });

                const chartData = [
                    { range: '0-50%', line_count: bucket1[0], branch_count: bucket1[1] },
                    { range: '50-75%', line_count: bucket2[0], branch_count: bucket2[1] },
                    { range: '75-90%', line_count: bucket3[0], branch_count: bucket3[1] },
                    { range: '90-100%', line_count: bucket4[0], branch_count: bucket4[1] }
                ];

                const formattedTreemapData = finalTableArray.map(repo => {
                    return {
                        name: repo.repository,
                        size: repo.latestTotalLines,
                        coverage: repo.lineCoverage
                    };
                });

                
                setTreemapData(formattedTreemapData);
                setDistributionData(chartData);

                setTableData(finalTableArray);
                setTotalReposCount(finalTableArray.length);
                setIsLoading(false);

            } catch (error) {
                // 1. Log it professionally for the devs
            logger.error("Failed to fetch dashboard data", error, "GlobalOverview");
        
        // 2. Stop the infinite loading spinner
        setIsLoading(false);
        
        // 3. Show a polite, user-friendly pop-up to the user!
        message.error("Unable to load repository data. Please try refreshing the page.");
            }
        };

        fetchDashboardData();
    }, []);

    const summaryMetrics = [
        {
            id: 1,
            title: 'Total Repositories',
            value: isLoading ? '...' : totalReposCount,
            icon: <AppstoreOutlined style={{ color: '#6366f1', fontSize: '20px' }} />,
            iconBg: '#e0e7ff'
        },
        {
            id: 2,
            title: 'Avg Line Coverage',
            value: isLoading ? '...' : `${globalAvgLineCoverage}%`,
            //tagText: <><ArrowUpOutlined /> Target: 80%</>,
            //tagColor: globalAvgLineCoverage >= 80 ? 'success' : 'warning',
            icon: <AimOutlined style={{ color: '#6366f1', fontSize: '20px' }} />,
            iconBg: '#e0e7ff'
        },
        {
            id: 3,
            title: 'Avg Branch Coverage',
            value: isLoading ? '...' : `${globalAvgBranchCoverage}%`,
            //tagText: `Target: 70%`,
            //tagColor: globalAvgBranchCoverage >= 80 ? 'success' : 'warning',
            icon: <LineChartOutlined style={{ color: '#6366f1', fontSize: '20px' }} />,
            iconBg: '#e0e7ff'
        },
    ];

    


    return (
        <div>
            {/* 2. PAGE HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Global Overview</Title>
                </div>
            </div>
            {/* 3. THRESHOLDS LEGEND */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px', marginRight: '8px' }}>COVERAGE THRESHOLDS</Text>
                <Space size="middle">
                    <Badge color="#ef4444" text={<Text type="secondary" style={{ fontSize: '12px' }}>Danger (&lt;50%)</Text>} />
                    <Badge color="#f59e0b" text={<Text type="secondary" style={{ fontSize: '12px' }}>Warning (50-70%)</Text>} />
                    <Badge color="#eab308" text={<Text type="secondary" style={{ fontSize: '12px' }}>Caution (70-80%)</Text>} />
                    <Badge color="#22c55e" text={<Text type="secondary" style={{ fontSize: '12px' }}>Good (&gt;80%)</Text>} />
                </Space>
            </div>


            <SummaryCards metrics={summaryMetrics} />

            {/* 3. NEW REPOSITORY HEALTH TABLE SECTION */}
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={18}>
                    <RepositoryHealth data={tableData} globalSearch={globalSearch} />
                </Col>

                {/* The Chart UI */}
                <Col xs={24} lg={6}>
                    <DistributionBarChart data={distributionData} />
                </Col>

            </Row>
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={16}>
                    <Heatmap data={treemapData} />
                </Col>
            </Row>
        </div>
    )
}

export default GlobalOverview