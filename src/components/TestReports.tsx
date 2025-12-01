import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

interface Report {
  id: string;
  name: string;
  type: string;
  filters: {
    startDate: string;
    endDate: string;
    categories?: string[];
    accounts?: string[];
    type?: string;
  };
  data?: any;
  status: string;
  exportedUrl?: string;
  exportFormat: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const TestReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Test data for creating different report types
  const testSpendingReport = {
    name: "Monthly Spending Analysis",
    type: "spending_by_category",
    filters: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      categories: ["food", "transport", "entertainment", "shopping"],
      type: "expense"
    },
    userId: USER_ID,
    exportFormat: "pdf"
  };

  const testIncomeVsExpenseReport = {
    name: "Income vs Expenses",
    type: "income_vs_expense",
    filters: {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
      endDate: new Date().toISOString().split('T')[0],
      accounts: ["all"]
    },
    userId: USER_ID,
    exportFormat: "pdf"
  };

  const testCashFlowReport = {
    name: "Cash Flow Statement",
    type: "cash_flow",
    filters: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0], // 3 months ago
      endDate: new Date().toISOString().split('T')[0],
      accounts: ["bank", "cash"]
    },
    userId: USER_ID,
    exportFormat: "excel"
  };

  const testNetWorthReport = {
    name: "Net Worth Tracker",
    type: "net_worth",
    filters: {
      startDate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0], // Start of last year
      endDate: new Date().toISOString().split('T')[0]
    },
    userId: USER_ID,
    exportFormat: "pdf"
  };

  // Test: Get all reports for user
  const testGetReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportsAPI.getReports(USER_ID);
      setReports(response.data);
      console.log('Reports:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching reports: ${errorMessage}`);
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create spending report
  const testCreateSpendingReport = async () => {
    setError('');
    try {
      const response = await reportsAPI.createReport(USER_ID, testSpendingReport);
      console.log('Spending report created:', response.data);
      alert('Spending report created successfully!');
      testGetReports();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating spending report: ${errorMessage}`);
      console.error('Error creating spending report:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create income vs expense report
  const testCreateIncomeVsExpenseReport = async () => {
    setError('');
    try {
      const response = await reportsAPI.createReport(USER_ID, testIncomeVsExpenseReport);
      console.log('Income vs Expense report created:', response.data);
      alert('Income vs Expense report created successfully!');
      testGetReports();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating income vs expense report: ${errorMessage}`);
      console.error('Error creating income vs expense report:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create cash flow report
  const testCreateCashFlowReport = async () => {
    setError('');
    try {
      const response = await reportsAPI.createReport(USER_ID, testCashFlowReport);
      console.log('Cash flow report created:', response.data);
      alert('Cash flow report created successfully!');
      testGetReports();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating cash flow report: ${errorMessage}`);
      console.error('Error creating cash flow report:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create net worth report
  const testCreateNetWorthReport = async () => {
    setError('');
    try {
      const response = await reportsAPI.createReport(USER_ID, testNetWorthReport);
      console.log('Net worth report created:', response.data);
      alert('Net worth report created successfully!');
      testGetReports();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating net worth report: ${errorMessage}`);
      console.error('Error creating net worth report:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create custom report
  const testCreateCustomReport = async () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    setError('');
    try {
      const customReport = {
        name: reportName,
        type: "spending_by_category",
        filters: {
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          categories: ["food", "transport"],
          type: "expense"
        },
        userId: USER_ID,
        exportFormat: "pdf"
      };

      const response = await reportsAPI.createReport(USER_ID, customReport);
      console.log('Custom report created:', response.data);
      alert('Custom report created successfully!');
      setReportName('');
      testGetReports();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating custom report: ${errorMessage}`);
      console.error('Error creating custom report:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Generate report data
  const testGenerateReport = async (reportId: string) => {
    try {
      const response = await reportsAPI.generateReport(reportId);
      console.log('Report data generated:', response.data);
      alert('Report data generated successfully!');
      testGetReports();
    } catch (error: any) {
      console.error('Error generating report data:', error);
      alert('Error generating report data');
    }
  };

  // Test: Export report
  const testExportReport = async (reportId: string, format: string = 'pdf') => {
    try {
      const response = await reportsAPI.exportReport(reportId, format);
      console.log('Report exported:', response.data);
      alert(`Report exported as ${format.toUpperCase()}! URL: ${response.data.url}`);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  // Test: Delete report
  const testDeleteReport = async (reportId: string) => {
    try {
      await reportsAPI.deleteReport(reportId);
      alert('Report deleted successfully!');
      testGetReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  useEffect(() => {
    testGetReports();
  }, []);

  // Helper functions
  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'spending_by_category': return '#F44336';
      case 'income_vs_expense': return '#4CAF50';
      case 'cash_flow': return '#2196F3';
      case 'net_worth': return '#9C27B0';
      default: return '#607D8B';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'spending_by_category': return '📊';
      case 'income_vs_expense': return '⚖️';
      case 'cash_flow': return '💸';
      case 'net_worth': return '💰';
      default: return '📈';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FF9800';
      case 'saved': return '#4CAF50';
      case 'exported': return '#2196F3';
      default: return '#607D8B';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>📈 Reports API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Generate financial reports and analytics for better insights</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Quick Report Templates</h4>
        <button onClick={testCreateSpendingReport} style={{ marginRight: '10px', marginBottom: '10px' }}>
          📊 Spending by Category
        </button>
        <button onClick={testCreateIncomeVsExpenseReport} style={{ marginRight: '10px', marginBottom: '10px' }}>
          ⚖️ Income vs Expenses
        </button>
        <button onClick={testCreateCashFlowReport} style={{ marginRight: '10px', marginBottom: '10px' }}>
          💸 Cash Flow
        </button>
        <button onClick={testCreateNetWorthReport} style={{ marginRight: '10px', marginBottom: '10px' }}>
          💰 Net Worth
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Custom Report</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
          <button onClick={testCreateCustomReport}>
            🎯 Create Custom Report
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testGetReports}>
          🔄 Refresh Reports
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Generated Reports ({reports.length})</h4>
        {reports.length === 0 && !loading && (
          <p style={{ color: '#666' }}>No reports found. Generate some reports to see them here.</p>
        )}
        {reports.map(report => {
          const typeColor = getReportTypeColor(report.type);
          const statusColor = getStatusColor(report.status);
          const typeIcon = getReportTypeIcon(report.type);
          
          return (
            <div key={report.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              borderLeft: `4px solid ${typeColor}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{typeIcon}</span>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '5px' }}>{report.name}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      Period: {formatDate(report.filters.startDate)} to {formatDate(report.filters.endDate)}
                    </p>
                    {report.data && (
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                        Data: {Object.keys(report.data).length} metrics calculated
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: typeColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {report.type.replace(/_/g, ' ')}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {report.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Created: {new Date(report.createdAt).toLocaleString()}
                  {report.exportedUrl && (
                    <span style={{ color: '#4CAF50', marginLeft: '10px' }}>
                      ✅ Exported
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => testGenerateReport(report.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Generate Data
                  </button>
                  <button 
                    onClick={() => testExportReport(report.id, report.exportFormat)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Export {report.exportFormat?.toUpperCase()}
                  </button>
                  <button 
                    onClick={() => testDeleteReport(report.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestReports;