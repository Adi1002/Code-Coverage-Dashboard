import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, message, Spin } from 'antd';
import { GoogleLogin } from '@react-oauth/google';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // This runs when Google successfully logs the user in
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      // 1. We get the Google Token
      const googleToken = credentialResponse.credential;

      // 2. We send it to your EC2 Backend to verify it's an Enboarder employee
      // NOTE: Replace this URL with the actual login endpoint from your backend team!
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        throw new Error('Unauthorized: Must be an Enboarder employee');
      }

      // 3. The backend replies with your official JWT Bearer Token
      const data = await response.json();
      
      // 4. Save the token securely in the browser
      localStorage.setItem('enboarder_jwt', data.token);

      // 5. Success! Send them to the dashboard
      message.success('Successfully logged in!');
      navigate('/');

    } catch (error) {
      console.error('Login Failed:', error);
      message.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Card 
        style={{ width: 400, textAlign: 'center', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        bordered={false}
      >
        {/* Placeholder for Enboarder/Dashboard Logo */}
        <div style={{ width: 48, height: 48, background: '#4f46e5', borderRadius: '8px', margin: '0 auto 16px' }} />
        
        <Title level={3} style={{ marginTop: 0 }}>Code Coverage</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '32px' }}>
          Please sign in with your Enboarder account
        </Text>

        {isLoading ? (
          <Spin size="large" />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => message.error('Google SSO popup failed to load or was closed.')}
              useOneTap
              shape="rectangular"
              theme="outline"
            />
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Login;