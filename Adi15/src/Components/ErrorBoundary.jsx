import React from 'react';
import { Result, Button } from 'antd';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the fatal UI crash to our centralized logger
    logger.error("Fatal UI Crash", { error, errorInfo }, "ErrorBoundary");
  }

  render() {
    if (this.state.hasError) {
      // The User-Friendly Fallback UI using Ant Design's <Result> component
      return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
          <Result
            status="500"
            title="Something went wrong"
            subTitle="Sorry, the dashboard encountered an unexpected error. Our engineering team has been notified."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            }
          />
        </div>
      );
    }

    // If there is no error, render the children normally
    return this.props.children; 
  }
}

export default ErrorBoundary;