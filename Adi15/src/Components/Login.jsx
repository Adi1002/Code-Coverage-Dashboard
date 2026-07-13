import React, { useState } from 'react';
import { Layout, Card, Typography, Button, Spin } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    // 1. Redirect the entire browser tab to your backend API!
    // Make sure to ask the backend team for the EXACT URL.
    window.location.href = 'https://100.24.9.250:8000/auth/login'; 
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card style={{ width: 400, textAlign: 'center', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} bordered={false}>
        <div style={{ width: 48, height: 48, background: '#4f46e5', borderRadius: '8px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <GithubOutlined style={{ fontSize: '24px', color: 'white' }} />
        </div>
        
        <Title level={3} style={{ marginTop: 0 }}>Code Coverage</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '32px' }}>
          Please sign in with your Enboarder account
        </Text>

        {isLoading ? (
          <Spin size="large" />
        ) : (
          <Button size="large" block icon={<GoogleOutlined />} onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>
            Sign in with Google
          </Button>
        )}
      </Card>
    </Layout>
  );
};

export default Login;