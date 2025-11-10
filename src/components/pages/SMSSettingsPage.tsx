import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, RefreshCw, Eye, EyeOff, Save, CheckCircle, AlertTriangle, Smartphone, DollarSign, Settings, BarChart3, Clock, X, TrendingUp } from 'lucide-react';
import { Button, Card, Input, Badge, Modal } from '../ui';
import { smsService, SMSSettings, SMSLog } from '../../services/smsService';
import { useErrorLogger } from '../../utils/errorLogger';

export default function SMSSettingsPage() {
  const { logInfo, logError } = useErrorLogger();
  const [activeTab, setActiveTab] = useState<'settings' | 'test' | 'logs' | 'statistics'>('settings');
  const [settings, setSettings] = useState<Partial<SMSSettings>>({
    api_key_encrypted: '',
    sender_name: '',
    api_url: 'https://tweetsms.ps/api.php/maan',
    max_daily_limit: 1000,
    low_balance_threshold: 100,
    low_balance_alert_enabled: true,
    is_active: false,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; smsId?: string } | null>(null);

  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(0);
  const logsPerPage = 20;

  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDays, setStatsDays] = useState(30);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    } else if (activeTab === 'statistics') {
      loadStatistics();
    }
  }, [activeTab, logsPage, statsDays]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await smsService.getSettings();
      if (data) {
        setSettings(data);
        if (data.last_balance_amount) {
          setBalance(data.last_balance_amount);
        }
      }
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.loadSettings');
      showNotification('فشل تحميل الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (!settings.api_key_encrypted || !settings.sender_name) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }

      const encryptedApiKey = await smsService.encrypt(settings.api_key_encrypted);

      await smsService.saveSettings({
        ...settings,
        api_key_encrypted: encryptedApiKey,
      });

      showNotification('تم حفظ الإعدادات بنجاح', 'success');
      logInfo('تم حفظ إعدادات SMS', 'SMSSettingsPage');
      await loadSettings();
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.handleSaveSettings');
      showNotification('فشل حفظ الإعدادات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckBalance = async () => {
    setBalanceLoading(true);
    try {
      const result = await smsService.checkBalance();
      if (result.success && result.balance !== undefined) {
        setBalance(result.balance);
        showNotification(`الرصيد الحالي: ${result.balance} رسالة`, 'success');
      } else {
        showNotification(result.error || 'فشل الاستعلام عن الرصيد', 'error');
      }
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.handleCheckBalance');
      showNotification('فشل الاستعلام عن الرصيد', 'error');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone || !testMessage) {
      showNotification('يرجى إدخال رقم الهاتف والرسالة', 'error');
      return;
    }

    if (!smsService.validatePhoneNumber(testPhone)) {
      showNotification('رقم الهاتف غير صحيح', 'error');
      return;
    }

    setTestSending(true);
    setTestResult(null);
    try {
      const result = await smsService.sendSMS(testPhone, testMessage, 'test');

      if (result.success) {
        setTestResult({
          success: true,
          message: 'تم إرسال الرسالة بنجاح',
          smsId: result.sms_id,
        });
        showNotification('تم إرسال الرسالة التجريبية بنجاح', 'success');
        setTestPhone('');
        setTestMessage('');
      } else {
        setTestResult({
          success: false,
          message: result.error || 'فشل الإرسال',
        });
        showNotification(result.error || 'فشل إرسال الرسالة', 'error');
      }
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.handleTestSMS');
      setTestResult({
        success: false,
        message: 'حدث خطأ في الإرسال',
      });
      showNotification('حدث خطأ في الإرسال', 'error');
    } finally {
      setTestSending(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await smsService.getSMSLogs(logsPerPage, logsPage * logsPerPage);
      setLogs(data);
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.loadLogs');
      showNotification('فشل تحميل السجلات', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  const loadStatistics = async () => {
    setStatsLoading(true);
    try {
      const data = await smsService.getSMSStatistics(statsDays);
      setStatistics(data);
    } catch (error) {
      logError(error as Error, 'SMSSettingsPage.loadStatistics');
      showNotification('فشل تحميل الإحصائيات', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'تم الإرسال';
      case 'failed': return 'فشل';
      case 'pending': return 'قيد الإرسال';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'otp': return 'رمز تحقق';
      case 'notification': return 'إشعار';
      case 'alert': return 'تنبيه';
      case 'test': return 'تجريبي';
      default: return 'مخصص';
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${
          notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
          'bg-blue-100 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات خدمة SMS</h1>
          <p className="text-gray-600 mt-1">إدارة اتصال TweetSMS API وإرسال رسائل التحقق</p>
        </div>
        {balance !== null && (
          <div className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 rounded-xl border border-blue-200">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">الرصيد المتبقي</p>
              <p className="text-2xl font-bold text-blue-900">{balance.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <Card>
        <div className="flex space-x-2 space-x-reverse border-b border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Settings className="w-5 h-5" />
              <span>إعدادات الاتصال</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'test'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Send className="w-5 h-5" />
              <span>تجربة الخدمة</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <MessageSquare className="w-5 h-5" />
              <span>سجل الرسائل</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'statistics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <BarChart3 className="w-5 h-5" />
              <span>الإحصائيات</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">كيفية الحصول على API Key</h4>
                    <p className="text-sm text-blue-700">
                      يمكنك الحصول على API Key من حسابك في TweetSMS. قم بتسجيل الدخول إلى لوحة التحكم الخاصة بك على موقع TweetSMS وانسخ API Key من قسم الإعدادات.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.api_key_encrypted || ''}
                      onChange={(e) => setSettings({ ...settings, api_key_encrypted: e.target.value })}
                      placeholder="أدخل API Key من حساب TweetSMS"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    مثال: 04e56a90592de205c8c0938efc7b52a5f564911f9f12beeb0258271897414f59
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المرسل <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.sender_name || ''}
                    onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                    placeholder="أدخل اسم المرسل (Name)"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الاسم الذي سيظهر للمستلم
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأقصى اليومي للرسائل
                  </label>
                  <Input
                    type="number"
                    value={settings.max_daily_limit || 1000}
                    onChange={(e) => setSettings({ ...settings, max_daily_limit: parseInt(e.target.value) })}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حد تنبيه الرصيد المنخفض
                  </label>
                  <Input
                    type="number"
                    value={settings.low_balance_threshold || 100}
                    onChange={(e) => setSettings({ ...settings, low_balance_threshold: parseInt(e.target.value) })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={settings.is_active || false}
                  onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  تفعيل خدمة SMS
                </label>
              </div>

              <div className="flex space-x-3 space-x-reverse pt-4 border-t">
                <Button
                  variant="primary"
                  icon={Save}
                  iconPosition="right"
                  onClick={handleSaveSettings}
                  loading={saving}
                  disabled={loading}
                >
                  حفظ الإعدادات
                </Button>
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  iconPosition="right"
                  onClick={handleCheckBalance}
                  loading={balanceLoading}
                  disabled={loading || !settings.is_active}
                >
                  فحص الرصيد
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">اختبار إرسال الرسائل</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      استخدم هذا النموذج لاختبار إرسال رسالة تجريبية والتأكد من صحة الإعدادات
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="مثال: 0599123456 أو 972599123456"
                    icon={Smartphone}
                    iconPosition="right"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك استخدام الصيغة: 0599123456 أو 972599123456
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص الرسالة <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="أدخل نص الرسالة التجريبية..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    عدد الأحرف: {testMessage.length}
                  </p>
                </div>

                <Button
                  variant="primary"
                  icon={Send}
                  iconPosition="right"
                  onClick={handleTestSMS}
                  loading={testSending}
                  disabled={!settings.is_active}
                >
                  إرسال رسالة تجريبية
                </Button>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                          {testResult.message}
                        </p>
                        {testResult.smsId && (
                          <p className="text-sm text-green-700 mt-1">
                            رقم الرسالة: {testResult.smsId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">سجل الرسائل المرسلة</h3>
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  iconPosition="right"
                  onClick={loadLogs}
                  loading={logsLoading}
                  size="sm"
                >
                  تحديث
                </Button>
              </div>

              {logsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">جاري التحميل...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 space-x-reverse mb-2">
                            <Badge variant="neutral" size="sm">
                              {getMessageTypeText(log.message_type)}
                            </Badge>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(log.status)}`}>
                              {getStatusText(log.status)}
                            </span>
                            {log.sms_id && (
                              <span className="text-xs text-gray-500">
                                #{log.sms_id}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {log.phone_number}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {log.message_text}
                          </p>
                          {log.error_message && (
                            <p className="text-xs text-red-600 mt-2">
                              خطأ: {log.error_message}
                            </p>
                          )}
                        </div>
                        <div className="text-left mr-4">
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleDateString('ar-SA')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => setLogsPage(Math.max(0, logsPage - 1))}
                      disabled={logsPage === 0}
                      size="sm"
                    >
                      السابق
                    </Button>
                    <span className="text-sm text-gray-600">
                      صفحة {logsPage + 1}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => setLogsPage(logsPage + 1)}
                      disabled={logs.length < logsPerPage}
                      size="sm"
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد رسائل مسجلة</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">إحصائيات الرسائل</h3>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <select
                    value={statsDays}
                    onChange={(e) => setStatsDays(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={7}>آخر 7 أيام</option>
                    <option value={30}>آخر 30 يوم</option>
                    <option value={90}>آخر 90 يوم</option>
                  </select>
                  <Button
                    variant="secondary"
                    icon={RefreshCw}
                    iconPosition="right"
                    onClick={loadStatistics}
                    loading={statsLoading}
                    size="sm"
                  >
                    تحديث
                  </Button>
                </div>
              </div>

              {statsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">جاري التحميل...</p>
                </div>
              ) : statistics ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600">إجمالي الرسائل</span>
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {statistics.total_sent?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-600">رسائل ناجحة</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {statistics.successful?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-red-600">رسائل فاشلة</span>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {statistics.failed?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-600">معدل النجاح</span>
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {statistics.success_rate || 0}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد إحصائيات متاحة</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {!settings.is_active && (
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800 mb-2">خدمة SMS غير مفعلة</h4>
              <p className="text-sm text-orange-700">
                يرجى تفعيل الخدمة من تبويب "إعدادات الاتصال" بعد إدخال بيانات الاتصال الصحيحة
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
