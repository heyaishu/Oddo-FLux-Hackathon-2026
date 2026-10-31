/**
 * Brightloop Subscription Management System
 * Developer 1: Backend & Database Console / REST API Interactive Suite
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  DollarSign,
  FileText,
  Key,
  Layers,
  Lock,
  Package,
  Play,
  RefreshCw,
  Send,
  Shield,
  Tag,
  Users,
  Flame,
  ExternalLink,
  Cloud,
} from 'lucide-react';

interface HealthData {
  status: string;
  system: string;
  timestamp: string;
  database: Record<string, number>;
}

interface TestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResult[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tests' | 'explorer' | 'database' | 'firebase' | 'architecture'>('tests');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | 'customer' | 'none'>('admin');
  const [authToken, setAuthToken] = useState<string>('');

  // Firebase Live Test state
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<any>(null);

  // API Explorer state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('auth-login');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('POST');
  const [requestUrl, setRequestUrl] = useState<string>('/api/auth/login');
  const [requestBody, setRequestBody] = useState<string>('{\n  "email": "admin@brightloop.io",\n  "password": "Admin@Brightloop2026!"\n}');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string>('');
  const [responseBody, setResponseBody] = useState<string>('Click "Send Request" to test API endpoint...');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Database Inspector state
  const [selectedCollection, setSelectedCollection] = useState<string>('products');
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // Fetch health on mount
  useEffect(() => {
    fetchHealth();
    loginAsRole('admin');
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error('Failed to fetch health', e);
    }
  };

  const loginAsRole = async (role: 'admin' | 'staff' | 'customer') => {
    setSelectedRole(role);
    let email = 'admin@brightloop.io';
    let password = 'Admin@Brightloop2026!';
    if (role === 'staff') {
      email = 'staff@brightloop.io';
      password = 'Staff@Brightloop2026!';
    } else if (role === 'customer') {
      email = 'demo.customer@acme.com';
      password = 'Customer@Brightloop2026!';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
      }
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/tests/run');
      const data = await res.json();
      if (data.summary) {
        setTestSummary(data.summary);
        fetchHealth();
      }
    } catch (e) {
      console.error('Error running test suite', e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Reset in-memory database to original seed state?')) return;
    try {
      await fetch('/api/tests/reset-db', { method: 'POST' });
      fetchHealth();
      if (testSummary) handleRunTests();
      loadCollection(selectedCollection);
    } catch (e) {
      console.error('Error resetting db', e);
    }
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const res = await fetch('/api/firebase/test');
      const json = await res.json();
      setFirebaseTestResult(json.data || json);
    } catch (err: any) {
      setFirebaseTestResult({
        connected: false,
        error: err.message,
        details: 'Could not contact server API for Firebase test.',
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const loadCollection = async (collection: string) => {
    setSelectedCollection(collection);
    setIsLoadingCollection(true);
    try {
      let endpoint = `/api/${collection}`;
      if (collection === 'plans') endpoint = '/api/plans';
      if (collection === 'users') endpoint = '/api/auth/users';

      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(endpoint, { headers });
      const json = await res.json();
      setCollectionData(json.data || (Array.isArray(json) ? json : []));
    } catch (e) {
      console.error('Error loading collection', e);
    } finally {
      setIsLoadingCollection(false);
    }
  };

  const endpointsList = [
    {
      id: 'auth-login',
      name: 'Auth: Login',
      method: 'POST',
      url: '/api/auth/login',
      body: JSON.stringify({ email: 'admin@brightloop.io', password: 'Admin@Brightloop2026!' }, null, 2),
    },
    {
      id: 'auth-register',
      name: 'Auth: Register Customer',
      method: 'POST',
      url: '/api/auth/register',
      body: JSON.stringify(
        {
          email: `client.${Math.floor(Math.random() * 9000 + 1000)}@startup.com`,
          password: 'SecurePassword2026!',
          displayName: 'Alex Rivers',
          companyName: 'Rivers Tech Ltd',
          billingAddress: '452 Market St, San Francisco, CA',
        },
        null,
        2
      ),
    },
    {
      id: 'auth-staff',
      name: 'Auth: Create Staff (Admin Only)',
      method: 'POST',
      url: '/api/auth/staff',
      body: JSON.stringify(
        {
          email: `ops.staff.${Math.floor(Math.random() * 900 + 100)}@brightloop.io`,
          password: 'StaffPassword2026!',
          displayName: 'Morgan Lee',
          department: 'Customer Success',
          roleTitle: 'Billing Analyst',
        },
        null,
        2
      ),
    },
    {
      id: 'prod-list',
      name: 'Products: List All',
      method: 'GET',
      url: '/api/products',
      body: '',
    },
    {
      id: 'prod-create',
      name: 'Products: Create Product with Variant',
      method: 'POST',
      url: '/api/products',
      body: JSON.stringify(
        {
          name: 'Dedicated AI Inference Node',
          sku: `SKU-AI-${Math.floor(Math.random() * 900 + 100)}`,
          type: 'service',
          salesPrice: 299.0,
          costPrice: 85.0,
          notes: 'High throughput dedicated GPU cluster node',
          variants: [
            {
              variantName: 'Double VRAM Upgrade',
              sku: `SKU-AI-VRAM-${Math.floor(Math.random() * 900 + 100)}`,
              additionalPricing: 120.0,
            },
          ],
        },
        null,
        2
      ),
    },
    {
      id: 'plan-list',
      name: 'Plans: List All Subscription Plans',
      method: 'GET',
      url: '/api/plans',
      body: '',
    },
    {
      id: 'sub-list',
      name: 'Subscriptions: List (Customer Isolated)',
      method: 'GET',
      url: '/api/subscriptions',
      body: '',
    },
    {
      id: 'sub-create',
      name: 'Subscriptions: Create New Subscription',
      method: 'POST',
      url: '/api/subscriptions',
      body: JSON.stringify(
        {
          customerId: 'cust-001',
          planId: 'plan-monthly-std',
          discountCode: 'WELCOME20',
          lineItems: [
            {
              productId: 'prod-crm',
              variantId: 'var-crm-pro',
              quantity: 2,
            },
          ],
        },
        null,
        2
      ),
    },
    {
      id: 'inv-generate',
      name: 'Invoices: Generate (Duplicate-Protected)',
      method: 'POST',
      url: '/api/invoices/generate',
      body: JSON.stringify(
        {
          subscriptionId: 'sub-sample-or-id',
          billingPeriodStart: '2026-11-01',
          billingPeriodEnd: '2026-12-01',
        },
        null,
        2
      ),
    },
    {
      id: 'pay-record',
      name: 'Payments: Record & Settle Invoice',
      method: 'POST',
      url: '/api/payments',
      body: JSON.stringify(
        {
          invoiceId: 'inv-id-here',
          amount: 50.0,
          paymentMethod: 'credit_card',
          transactionReference: 'TXN-STRIPE-8912',
          notes: 'Customer card settlement',
        },
        null,
        2
      ),
    },
    {
      id: 'disc-validate',
      name: 'Discounts: Validate Coupon Code',
      method: 'POST',
      url: '/api/discounts/validate',
      body: JSON.stringify(
        {
          code: 'WELCOME20',
          subtotal: 150.0,
          totalQuantity: 2,
          lineItems: [{ productId: 'prod-crm', lineTotal: 150.0, quantity: 2 }],
        },
        null,
        2
      ),
    },
  ];

  const handleSelectEndpoint = (ep: (typeof endpointsList)[0]) => {
    setSelectedEndpoint(ep.id);
    setRequestMethod(ep.method as any);
    setRequestUrl(ep.url);
    setRequestBody(ep.body);
  };

  const handleExecuteRequest = async () => {
    setIsSending(true);
    setResponseStatus(null);
    setResponseBody('Executing HTTP request...');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const options: RequestInit = {
        method: requestMethod,
        headers,
      };

      if (requestMethod !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(requestUrl, options);
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseBody(JSON.stringify(data, null, 2));
      fetchHealth();
    } catch (e: any) {
      setResponseBody(JSON.stringify({ error: e.message || 'Network request failed' }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Brightloop <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">Developer 1 Backend</span>
            </h1>
            <p className="text-xs text-slate-400">Subscription Management System REST API & Firestore Database</p>
          </div>
        </div>

        {/* Global Role Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-slate-400 font-medium flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Active Role:
            </span>
            <button
              onClick={() => loginAsRole('admin')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedRole === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAsRole('staff')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedRole === 'staff' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => loginAsRole('customer')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedRole === 'customer' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer
            </button>
          </div>

          <button
            onClick={handleResetDb}
            title="Reset database to seed state"
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset DB
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Automated Tests {testSummary && `(${testSummary.passed}/${testSummary.total})`}
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'explorer'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" /> REST API Explorer & Runner
        </button>
        <button
          onClick={() => {
            setActiveTab('database');
            loadCollection(selectedCollection);
          }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" /> Database Collections
        </button>
        <button
          onClick={() => {
            setActiveTab('firebase');
            if (!firebaseTestResult) handleTestFirebase();
          }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'firebase'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" /> Firebase Cloud
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Architecture
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: AUTOMATED TESTS */}
        {activeTab === 'tests' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-xl">
              <div>
                <h2 className="text-lg font-semibold text-white">Backend Test Suite & Business Invariants</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Tests password security, unique emails, RBAC, variant pricing, discount engine, tax calculation, state transitions, duplicate billing prevention, and payment settlement.
                </p>
              </div>
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {isRunningTests ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunningTests ? 'Running Suite...' : 'Run All Backend Tests'}
              </button>
            </div>

            {testSummary ? (
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  testSummary.failed === 0
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {testSummary.failed === 0 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <div className="font-bold text-base">
                        {testSummary.failed === 0 ? 'All Test Invariants Passed!' : `${testSummary.failed} Test(s) Failed`}
                      </div>
                      <div className="text-xs opacity-80">
                        {testSummary.passed} / {testSummary.total} assertions succeeded in {testSummary.durationMs}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono px-3 py-1 bg-black/40 rounded border border-white/10">
                    HTTP GET /api/tests/run
                  </div>
                </div>

                {/* Test Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testSummary.results.map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start justify-between hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {t.category}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{t.durationMs}ms</span>
                        </div>
                        <div className="text-sm font-medium text-slate-200">{t.name}</div>
                        {t.error && <div className="text-xs text-rose-400 font-mono mt-1">{t.error}</div>}
                      </div>
                      <div>
                        {t.passed ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-300">No Tests Executed Yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Click the button above to run the 11+ automated test suites against the live Express backend.
                </p>
                <button
                  onClick={handleRunTests}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4" /> Run Automated Tests
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REST API EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
            {/* Sidebar with Endpoints */}
            <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">REST Endpoints</h3>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {endpointsList.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      selectedEndpoint === ep.id
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{ep.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-300'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Bearer Token */}
              <div className="pt-3 border-t border-slate-800">
                <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                  <span>Bearer Authorization Token:</span>
                  <span className="text-indigo-400 font-mono">({selectedRole})</span>
                </label>
                <input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Request & Response Editor */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                {/* Request Bar */}
                <div className="flex gap-2">
                  <select
                    value={requestMethod}
                    onChange={(e) => setRequestMethod(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-indigo-400 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={requestUrl}
                    onChange={(e) => setRequestUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleExecuteRequest}
                    disabled={isSending}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send
                  </button>
                </div>

                {/* Request Body Editor */}
                {requestMethod !== 'GET' && (
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">JSON Payload:</label>
                    <textarea
                      rows={7}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Response Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Response</span>
                  {responseStatus !== null && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[350px]">
                  {responseBody}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE COLLECTIONS */}
        {activeTab === 'database' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Collection Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                'products',
                'plans',
                'subscriptions',
                'invoices',
                'payments',
                'taxes',
                'discounts',
                'quotations',
                'customers',
                'users',
              ].map((col) => (
                <button
                  key={col}
                  onClick={() => loadCollection(col)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                    selectedCollection === col
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {col} ({health?.database?.[col] ?? '•'})
                </button>
              ))}
            </div>

            {/* Collection Data Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white capitalize flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" /> Collection: /{selectedCollection}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {collectionData.length} records found
                </span>
              </div>

              {isLoadingCollection ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading collection data...
                </div>
              ) : collectionData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No records stored in this collection yet.
                </div>
              ) : (
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px]">
                  {JSON.stringify(collectionData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FIREBASE CLOUD INTEGRATION */}
        {activeTab === 'firebase' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-white">Live Firebase & Cloud Firestore Integration</h2>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Connected to Web App in Project <span className="text-amber-400 font-mono font-medium">brightloop-subscription-manage</span>
                </p>
              </div>
              <button
                onClick={handleTestFirebase}
                disabled={isTestingFirebase}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                {isTestingFirebase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                {isTestingFirebase ? 'Testing Connection...' : 'Test Cloud Firestore Read/Write'}
              </button>
            </div>

            {/* Test Result Card */}
            {firebaseTestResult && (
              <div className={`p-5 rounded-xl border ${
                firebaseTestResult.connected
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {firebaseTestResult.connected ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-base text-white">
                        {firebaseTestResult.connected
                          ? 'Live Cloud Firestore Connected & Operational!'
                          : 'Firebase Project Recognized – Cloud Firestore Database Initialization Required'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {firebaseTestResult.details || firebaseTestResult.error}
                      </p>

                      {!firebaseTestResult.connected && (
                        <div className="mt-4 p-4 bg-slate-950/80 border border-amber-700/50 rounded-lg space-y-2">
                          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                            Action Required to Enable Live Cloud Firestore:
                          </div>
                          <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1">
                            <li>
                              Open your Firebase Console:{' '}
                              <a
                                href="https://console.firebase.google.com/project/brightloop-subscription-manage/firestore"
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-400 underline inline-flex items-center gap-1 font-mono hover:text-amber-300"
                              >
                                console.firebase.google.com/project/brightloop-subscription-manage/firestore <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                            <li>Click the <span className="font-semibold text-white">"Create database"</span> button.</li>
                            <li>Select your preferred Cloud region and choose <span className="font-semibold text-white">"Start in test mode"</span>.</li>
                            <li>Once created, return here and click <span className="font-semibold text-white">"Test Cloud Firestore Read/Write"</span> to verify live write/read!</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                  {firebaseTestResult.latencyMs && (
                    <span className="text-xs font-mono px-2.5 py-1 bg-black/40 rounded border border-white/10 shrink-0">
                      {firebaseTestResult.latencyMs}ms
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Config Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-indigo-400" /> Firebase Web App Configuration
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Project ID:</span>
                    <span className="text-amber-400">brightloop-subscription-manage</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Auth Domain:</span>
                    <span className="text-slate-200">brightloop-subscription-manage.firebaseapp.com</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">App ID:</span>
                    <span className="text-slate-200 truncate max-w-[220px]">1:707407513645:web:6d7b4fd8792947248790a4</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Storage Bucket:</span>
                    <span className="text-slate-200">brightloop-subscription-manage.firebasestorage.app</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> Database Collections Ready to Sync
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'users',
                    'customers',
                    'staff',
                    'products',
                    'productVariants',
                    'subscriptionPlans',
                    'quotations',
                    'subscriptions',
                    'invoices',
                    'taxRules',
                    'discounts',
                    'payments',
                  ].map((col) => (
                    <div key={col} className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      /{col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ARCHITECTURE & SECURITY */}
        {activeTab === 'architecture' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Authentication & RBAC</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict password complexity validation (&gt;8 chars, uppercase, lowercase, special character), unique email enforcement, Bearer JWT token generation, and server-side role validation for Admin, Staff, and Customer.
                </p>
                <div className="text-[11px] text-emerald-400 font-mono">Active & Enforced</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Customer Record Isolation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customers are strictly restricted to their own customer profile, subscriptions, invoices, and payment records. Requests to query or mutate other customer data return HTTP 403 Forbidden.
                </p>
                <div className="text-[11px] text-indigo-400 font-mono">Hardened Middleware</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Invoicing & Tax Calculation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guaranteed duplicate billing prevention across cycles, configurable jurisdiction tax rules, product variants with price deltas, and automated transition of invoices to Paid on balance settlement.
                </p>
                <div className="text-[11px] text-amber-400 font-mono">Verified by Test Suite</div>
              </div>
            </div>

            {/* Architecture Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Developer 1 Module Architecture Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { title: 'Database Design', desc: '14 Firestore entities in firebase-blueprint.json & firestore.rules', done: true },
                  { title: 'Customer Registration & Login', desc: 'Password complexity & unique email validation', done: true },
                  { title: 'RBAC (Admin, Staff, Customer)', desc: 'Admin creates staff; Customer isolated to own records', done: true },
                  { title: 'Product & Variant Management', desc: 'Goods/service types, sales/cost prices, variant price deltas', done: true },
                  { title: 'Subscription Plans', desc: 'Daily, weekly, monthly, yearly intervals, minimum quantities', done: true },
                  { title: 'Subscription Engine', desc: 'Unique sequential numbers (SUB-YYYY-XXXX), status state machine', done: true },
                  { title: 'Lifecycle Actions', desc: 'Pause, resume, renew, cancel, and close subscriptions', done: true },
                  { title: 'Invoice Generation', desc: 'Cycle billing with duplicate billing prevention and taxes', done: true },
                  { title: 'Discount Rules Engine', desc: 'Fixed & percentage, min purchase/qty, usage limits, product scope', done: true },
                  { title: 'Payment Management', desc: 'Record payments, update outstanding balance, auto-settle to Paid', done: true },
                  { title: 'Quotations Management', desc: 'Draft quotes with one-click conversion to Confirmed subscription', done: true },
                  { title: 'Automated Test Suite', desc: '11 comprehensive business logic & invariant test suites', done: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
