import React from 'react'
import { Layout, Input, Avatar, Space, Typography, Divider } from 'antd';
import { UserOutlined, SearchOutlined, BellOutlined, SettingOutlined, ApiOutlined, CodeOutlined, GithubOutlined } from '@ant-design/icons';
// Add useLocation to your React Router imports
import { useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;


const DashboardLayout = ({ children, setGlobalSearch }) => {
    // NEW: Get the current URL path
    const location = useLocation();

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* Responsive rules: the inline styles below cover the default desktop layout,
                this block handles wrapping/shrinking behaviour at narrow widths. */}
            <style>{`
                .dash-header {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px 16px;
                }
                .dash-search-wrap {
                    flex: 1 1 220px;
                    max-width: 400px;
                    min-width: 160px;
                    order: 2;
                }
                .dash-logo {
                    flex-shrink: 0;
                    order: 1;
                }
                .dash-avatar {
                    flex-shrink: 0;
                    margin-left: auto;
                    order: 3;
                }
                @media (max-width: 576px) {
                    .dash-header { padding: 12px 16px !important; height: auto !important; }
                    .dash-logo .dash-logo-text { font-size: 17px !important; }
                    .dash-search-wrap { order: 3; flex-basis: 100%; max-width: 100%; }
                    .dash-avatar { order: 2; }
                }
            `}</style>

            <Header className="dash-header"
                style={{
                    //display: 'flex',
                    //alignItems: 'center',
                    //justifyContent: 'space-between',
                    background: '#ffffff',
                    borderBottom: '1px solid #f0f0f0',
                    padding: '0 24px',
                    //height: 'auto',
                    lineHeight: 'normal'
                }}>

                {/* Logo Section */}
                {/* NEW: Added align="center" to perfectly level the icon and text */}
                <Space size="middle" align="center" className="dash-logo">
                    <GithubOutlined style={{ fontSize: '28px', color: '#4f46e5' }} />

                    {/* NEW: Added margin: 0 and lineHeight: 1 to strip any invisible text spacing */}
                    <Text strong style={{ fontSize: '22px', color: '#4f46e5', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>
                        Code Coverage Dashboard
                    </Text>
                </Space>

                {/* NEW: Conditionally render the search bar ONLY on the home page */}
                <div className="dash-search-wrap" style={{
                    width: '400px',
                    display: 'block',
                    margin: '0 auto' // Pushes equally from the left and right
                }}>
                    {location.pathname === '/' ? (
                        <Input.Search
                            placeholder="Search repositories..."
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    ) : (
                        // Renders an empty invisible block to keep the spacing balanced when the search bar is gone
                        <div style={{ width: '100%' }}></div>
                    )}
                </div>

                {/* Right: Meta Info, Notifications, and Profile */}
                <Space size="large" align="center" className="dash-avatar">
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d3d3d3', color: 'black' }} />
                </Space>

            </Header>

            {/* 2. MAIN CONTENT AREA */}
            <Content style={{ padding: '24px', background: '#f8fafc' }}>
                {/* The 'children' prop renders whatever page is currently active inside this shell */}
                {children}
            </Content>

            {/* 3. FOOTER */}
            <Footer style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#ffffff',
                borderTop: '1px solid #f0f0f0',
                padding: '12px 24px',
                fontSize: '12px'
            }}>

            </Footer>

        </Layout>
    )
}

export default DashboardLayout