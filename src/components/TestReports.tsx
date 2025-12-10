// src/features/reports/TestReports.tsx
import React, { useState } from 'react';
import { 
  useGetUserReportsQuery,
  useCreateReportMutation,
  type Report
} from '../features/reports/reportsApi'; // FIXED: Import from features/reports

const TestReports: React.FC = () => {
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";
  
  // RTK Query hooks
  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useGetUserReportsQuery(USER_ID);
  const [createReport, { isLoading: creatingReport }] = useCreateReportMutation();
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');

  // Test data for creating different report types
  const testSpendingReport = {
    userId: USER_ID,
    reportData: {
      name: "Monthly Spending Analysis",
      type: "spending_by_category" as const,
      filters: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        categories: ["food", "transport", "entertainment", "shopping"],
        type: "expense" as const
      },
      exportFormat: "pdf" as const
    }
  };

  const testIncomeVsExpenseReport = {
    userId: USER_ID,
    reportData: {
      name: "Income vs Expenses",
      type: "income_vs_expense" as const,
      filters: {
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        accounts: ["all"]
      },
      exportFormat: "pdf" as const
    }
  };

  const testCashFlowReport = {
    userId: USER_ID,
    reportData: {
      name: "Cash Flow Statement",
      type: "cash_flow" as const,
      filters: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        accounts: ["bank", "cash"]
      },
      exportFormat: "excel" as const
    }
  };

  const testNetWorthReport = {
    userId: USER_ID,
    reportData: {
      name: "Net Worth Tracker",
      type: "net_worth" as const,
      filters: {
        startDate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      exportFormat: "pdf" as const
    }
  };

  // Test: Create spending report
  const testCreateSpendingReport = async () => {
    setError('');
    setSuccess('');
    try {
      await createReport(testSpendingReport).unwrap();
      setSuccess('Spending report created successfully!');
      refetchReports();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating spending report: ${errorMessage}`);
      console.error('Error creating spending report:', error);
    }
  };

  // Test: Create income vs expense report
  const testCreateIncomeVsExpenseReport = async () => {
    setError('');
    setSuccess('');
    try {
      await createReport(testIncomeVsExpenseReport).unwrap();
      setSuccess('Income vs Expense report created successfully!');
      refetchReports();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating income vs expense report: ${errorMessage}`);
      console.error('Error creating income vs expense report:', error);
    }
  };

  // Test: Create cash flow report
  const testCreateCashFlowReport = async () => {
    setError('');
    setSuccess('');
    try {
      await createReport(testCashFlowReport).unwrap();
      setSuccess('Cash flow report created successfully!');
      refetchReports();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating cash flow report: ${errorMessage}`);
      console.error('Error creating cash flow report:', error);
    }
  };

  // Test: Create net worth report
  const testCreateNetWorthReport = async () => {
    setError('');
    setSuccess('');
    try {
      await createReport(testNetWorthReport).unwrap();
      setSuccess('Net worth report created successfully!');
      refetchReports();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating net worth report: ${errorMessage}`);
      console.error('Error creating net worth report:', error);
    }
  };

  // Test: Create custom report
  const testCreateCustomReport = async () => {
    if (!reportName.trim()) {
      setError('Please enter a report name');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const customReport = {
        userId: USER_ID,
        reportData: {
          name: reportName,
          type: "spending_by_category" as const,
          filters: {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            categories: ["food", "transport"],
            type: "expense" as const
          },
          exportFormat: "pdf" as const
        }
      };

      await createReport(customReport).unwrap();
      setSuccess('Custom report created successfully!');
      setReportName('');
      refetchReports();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating custom report: ${errorMessage}`);
      console.error('Error creating custom report:', error);
    }
  };

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

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Safely cast reports to Report[] type
  const reportList: Report[] = Array.isArray(reports) ? reports : [];

  return (
    <div style={{ padding: '20px', border: '2px solid #9C27B0', margin: '10px', borderRadius: '8px' }}>
      <h3>📈 Reports API Test (RTK Query)</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p style={{ fontSize: '12px', margin: '5px 0' }}>Using RTK Query hooks for reports</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Quick Report Templates</h4>
        <button 
          onClick={testCreateSpendingReport} 
          disabled={creatingReport}
          style={{ 
            marginRight: '10px', 
            marginBottom: '10px',
            padding: '10px 15px',
            backgroundColor: creatingReport ? '#ccc' : '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingReport ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Spending by Category
        </button>
        <button 
          onClick={testCreateIncomeVsExpenseReport} 
          disabled={creatingReport}
          style={{ 
            marginRight: '10px', 
            marginBottom: '10px',
            padding: '10px 15px',
            backgroundColor: creatingReport ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingReport ? 'not-allowed' : 'pointer'
          }}
        >
          ⚖️ Income vs Expenses
        </button>
        <button 
          onClick={testCreateCashFlowReport} 
          disabled={creatingReport}
          style={{ 
            marginRight: '10px', 
            marginBottom: '10px',
            padding: '10px 15px',
            backgroundColor: creatingReport ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingReport ? 'not-allowed' : 'pointer'
          }}
        >
          💸 Cash Flow
        </button>
        <button 
          onClick={testCreateNetWorthReport} 
          disabled={creatingReport}
          style={{ 
            marginRight: '10px', 
            marginBottom: '10px',
            padding: '10px 15px',
            backgroundColor: creatingReport ? '#ccc' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingReport ? 'not-allowed' : 'pointer'
          }}
        >
          💰 Net Worth
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Custom Report</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            style={{ 
              padding: '8px', 
              width: '250px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={testCreateCustomReport}
            disabled={creatingReport || !reportName.trim()}
            style={{
              padding: '8px 15px',
              backgroundColor: creatingReport || !reportName.trim() ? '#ccc' : '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creatingReport || !reportName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            🎯 Create Custom Report
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => refetchReports()}
          disabled={reportsLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: reportsLoading ? '#ccc' : '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: reportsLoading ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Refresh Reports
        </button>
      </div>

      {(reportsLoading || creatingReport) && <p style={{ color: '#666' }}>Loading...</p>}
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div style={{ 
          color: '#388e3c', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #66bb6a'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}
      
      <div>
        <h4>Generated Reports ({reportList.length})</h4>
        {reportList.length === 0 && !reportsLoading ? (
          <p style={{ 
            color: '#666', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            No reports found. Generate some reports to see them here.
          </p>
        ) : (
          reportList.map((report: Report) => {
            const typeColor = getReportTypeColor(report.type);
            const typeIcon = getReportTypeIcon(report.type);
            
            return (
              <div key={report.id} style={{ 
                border: '1px solid #eee', 
                margin: '10px 0', 
                padding: '15px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                borderLeft: `4px solid ${typeColor}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{typeIcon}</span>
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '5px' }}>{report.name}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Period: {formatDate(report.filters?.startDate)} to {formatDate(report.filters?.endDate)}
                      </p>
                      {report.data && (
                        <p style={{ margin: 0, color: '#666', fontSize: '12px', marginTop: '3px' }}>
                          📊 Data: {Object.keys(report.data).length} metrics calculated
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px',
                      backgroundColor: typeColor,
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {report.type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ 
                      padding: '4px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {report.exportFormat?.toUpperCase() || 'PDF'}
                    </span>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                  📅 Created: {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TestReports;