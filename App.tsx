import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Search, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  Wallet, 
  Clock, 
  Plus,
  ChevronRight,
  MessageCircle,
  Download,
  Moon,
  Sun,
  ShieldCheck,
  Filter,
  Pencil,
  Trash2,
  User,
  CreditCard,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, subMonths, startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from 'date-fns';
import { cn, formatCurrency, getMonthName, MONTHS } from './utils';
import { Group, Member, Payment, DashboardStats } from './types';

import CountUp from 'react-countup';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Translations ---

const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    dashboard: "Dashboard",
    groups: "Groups",
    search: "Search Members",
    admin_login: "Admin Login",
    logout: "Logout Admin",
    total_collected: "Total Collected",
    total_members: "Total Members",
    active_groups: "Active Groups",
    monthly_trend: "Monthly Collection Trend",
    last_6_months: "Last 6 months performance",
    payment_settings: "Payment Settings",
    export_reports: "Export Reports",
    due_date: "Payment Due Day",
    day_of_month: "day of month",
    done: "Done",
    startup_settings: "Startup Animation",
    startup_enabled: "Enable Startup Animation",
    startup_title: "Startup Title",
    startup_credit: "Startup Credit",
    startup_image: "Startup Image",
    startup_duration: "Duration (ms)",
    startup_bg: "Background Color",
    language: "Language",
    paid: "Paid",
    unpaid: "Unpaid",
    due: "Due",
    pending: "Pending",
    upcoming: "Upcoming",
    accrued: "Total Accrued",
    received: "Total Received",
    overdue: "Total Overdue",
    balance: "Outstanding Balance",
    partial: "Partial",
    add_fund: "Add Fund",
    advance: "Advance",
    send_reminder: "Send Reminder",
    payment_timeline: "Monthly Payment Timeline",
    status_for_year: "Status for the year",
    edit_member: "Edit Member",
    delete_member: "Delete Member",
    month: "Month",
    amount: "Amount",
    method: "Method",
    date: "Date",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    per_month: "per month",
    admin_panel: "Admin Panel",
    admin_panel_desc: "Access management tools and reports",
    app_settings: "App Settings",
    app_name: "Application Name",
    app_logo: "App Logo / Profile Icon",
    admin_credentials: "Admin Credentials",
    username: "Username",
    password: "Password",
    save_changes: "Save Changes",
    currency: "Currency",
    admin_profile: "Admin Profile",
    search_placeholder: "Search members by name or code...",
    date_range: "Select Date Range",
    from: "From",
    to: "To",
    download: "Download Report",
    no_payments: "No payments found for this period.",
    total_cost_deposited: "Total Cost Deposited",
    outstanding_dues: "Outstanding Dues",
    all_groups: "All Groups",
    select_group: "Select Group",
    report_type: "Report Type",
    all_records: "All Records (Paid & Unpaid)",
    only_paid: "Only Paid Records",
    only_unpaid: "Only Unpaid Records"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    groups: "समूह",
    search: "सदस्य खोजें",
    admin_login: "एडमिन लॉगिन",
    logout: "एडमिन लॉगआउट",
    total_collected: "कुल जमा",
    total_members: "कुल सदस्य",
    active_groups: "सक्रिय समूह",
    monthly_trend: "मासिक संग्रह रुझान",
    last_6_months: "पिछले 6 महीनों का प्रदर्शन",
    payment_settings: "भुगतान सेटिंग्स",
    export_reports: "रिपोर्ट निर्यात करें",
    due_date: "भुगतान की देय तिथि",
    day_of_month: "महीने का दिन",
    done: "हो गया",
    startup_settings: "स्टार्टअप एनीमेशन",
    startup_enabled: "स्टार्टअप एनीमेशन सक्षम करें",
    startup_title: "स्टार्टअप शीर्षक",
    startup_credit: "स्टार्टअप क्रेडिट",
    startup_image: "स्टार्टअप इमेज",
    startup_duration: "अवधि (ms)",
    startup_bg: "पृष्ठभूमि का रंग",
    language: "भाषा",
    paid: "भुगतान किया",
    unpaid: "अवैतनिक",
    due: "देय",
    pending: "लंबित",
    upcoming: "आगामी",
    accrued: "कुल अर्जित",
    received: "कुल प्राप्त",
    overdue: "कुल बकाया",
    balance: "बकाया राशि",
    partial: "आंशिक",
    add_fund: "फंड जोड़ें",
    advance: "अग्रिम",
    send_reminder: "रिमाइंडर भेजें",
    payment_timeline: "मासिक भुगतान समयरेखा",
    status_for_year: "वर्ष के लिए स्थिति",
    admin_panel: "एडमिन पैनल",
    admin_panel_desc: "प्रबंधन उपकरण और रिपोर्ट एक्सेस करें",
    edit_member: "सदस्य संपादित करें",
    delete_member: "सदस्य हटाएं",
    month: "महीना",
    amount: "राशि",
    method: "तरीका",
    date: "तारीख",
    notes: "नोट्स",
    save: "सहेजें",
    cancel: "रद्द करें",
    per_month: "प्रति माह",
    app_settings: "ऐप सेटिंग्स",
    app_name: "एप्लिकेशन का नाम",
    app_logo: "ऐप लोगो / प्रोफाइल आइकन",
    admin_credentials: "एडमिन क्रेडेंशियल",
    username: "यूजरनेम",
    password: "पासवर्ड",
    save_changes: "परिवर्तन सहेजें",
    currency: "मुद्रा",
    admin_profile: "एडमिन प्रोफाइल",
    search_placeholder: "नाम या कोड से सदस्य खोजें...",
    date_range: "तिथि सीमा चुनें",
    from: "कब से",
    to: "कब तक",
    download: "रिपोर्ट डाउनलोड करें",
    no_payments: "इस अवधि के लिए कोई भुगतान नहीं मिला।",
    total_cost_deposited: "कुल जमा राशि",
    outstanding_dues: "कुल बकाया राशि",
    all_groups: "सभी समूह",
    select_group: "समूह चुनें",
    report_type: "रिपोर्ट का प्रकार",
    all_records: "सभी रिकॉर्ड (भुगतान और बकाया)",
    only_paid: "केवल भुगतान किए गए",
    only_unpaid: "केवल बकाया रिकॉर्ड"
  }
};

// --- Components ---

const StartupAnimation = ({ settings, onComplete }: { settings: any, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, parseInt(settings.startup_duration || '3000'));
    return () => clearTimeout(timer);
  }, [settings.startup_duration, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: settings.startup_bg_color || '#ffffff' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <img 
          src={settings.startup_image || 'https://picsum.photos/seed/masjid/400/400'} 
          alt="Startup"
          className="w-48 h-48 object-cover rounded-2xl shadow-2xl mb-8"
          referrerPolicy="no-referrer"
        />
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
          {settings.startup_title || 'Masjid-e-Hussain'}
        </h1>
        <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">
          {settings.startup_credit || 'By Mohsin Raza Qadri'}
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '120px' }}
        transition={{ duration: parseInt(settings.startup_duration || '3000') / 1000, ease: "linear" }}
        className="h-1 bg-primary-600 rounded-full mt-12"
      />
    </motion.div>
  );
};

const Counter = memo(({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => (
  <CountUp
    end={value}
    duration={2}
    separator=","
    decimals={decimals}
    prefix={prefix}
    suffix={suffix}
    useEasing={true}
  />
));

const ScrollingBanner = memo(({ stats, t, getCurrencySymbol }: { stats: any, t: (key: string) => string, getCurrencySymbol: () => string }) => {
  if (!stats) return null;

  const items = useMemo(() => [
    { label: t('accrued'), value: stats.totalAccrued || 0, isCurrency: true, color: 'text-slate-900' },
    { label: t('received'), value: stats.totalCollected || 0, isCurrency: true, color: 'text-emerald-600' },
    { label: t('overdue'), value: stats.totalOverdue || 0, isCurrency: true, color: 'text-rose-600' },
    { label: t('balance'), value: (stats.totalAccrued || 0) - (stats.totalCollected || 0), isCurrency: true, color: 'text-amber-600' },
    ...(stats.groupStats || []).flatMap((g: any) => [
      { label: `${g.name} ${t('paid')}`, value: g.paidCount, isCurrency: false, color: 'text-emerald-600' },
      { label: `${g.name} ${t('unpaid')}`, value: g.unpaidCount, isCurrency: false, color: 'text-rose-600' },
    ])
  ], [stats, t]);

  return (
    <div className="bg-white py-3 overflow-hidden relative border-y border-slate-100">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      
      <motion.div 
        animate={{ x: [0, -2000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-16 whitespace-nowrap px-4"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
            <span className={cn("text-sm font-mono font-bold tracking-tight", item.color)}>
              <Counter value={item.value} prefix={item.isCurrency ? `${getCurrencySymbol()} ` : ""} />
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
});

const Card = memo(({ children, className, title, subtitle, action }: any) => (
  <div className={cn("bg-white rounded-2xl p-5 shadow-sm border border-slate-100", className)}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        <div>
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
));

const StatCard = memo(({ title, value, icon: Icon, trend, trendColor, isCurrency, currency }: any) => (
  <Card className="flex items-center gap-4">
    <div className="p-3 rounded-xl bg-primary-50">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <h2 className="text-xl font-bold text-slate-900">
        <Counter value={value} prefix={isCurrency ? `${currency} ` : ""} />
      </h2>
      {trend && (
        <p className={cn("text-[10px] mt-0.5 font-medium", trend > 0 ? (trendColor || "text-primary-600") : "text-rose-500")}>
          {trend > 0 ? '+' : ''}{trend}% from last month
        </p>
      )}
    </div>
  </Card>
));

const Modal = memo(({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </motion.div>
  </div>
));

const NavItem = memo(({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      active 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
    <span className="font-bold text-sm">{label}</span>
  </button>
));

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'groups' | 'members' | 'search' | 'admin'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear());
  const [timelineYear, setTimelineYear] = useState(new Date().getFullYear());
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [memberAvatar, setMemberAvatar] = useState<string | null>(null);

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [activeTimelineItem, setActiveTimelineItem] = useState<{month: number, year: number} | null>(null);
  const [settings, setSettings] = useState<{ [key: string]: string }>({ due_date: '15', language: 'en' });

  const getCurrencySymbol = () => {
    const currency = settings.currency || 'PKR';
    const symbols: { [key: string]: string } = {
      'PKR': '₨',
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'SAR': 'SR',
      'AED': 'dh'
    };
    return symbols[currency] || currency;
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showStartup, setShowStartup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState({ 
    from: format(subMonths(new Date(), 5), 'yyyy-MM'), 
    to: format(new Date(), 'yyyy-MM'),
    groupId: '',
    reportType: 'all' // all, paid, unpaid
  });

  const generatePDF = (data: any[], title: string, filename: string, summary?: { label: string, value: string | number }[]) => {
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // primary-600
    doc.text(settings.app_name || 'Masjid-e-Hussain', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(title, 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    let currentY = 45;

    // Add Summary if provided
    if (summary && summary.length > 0) {
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 42, 182, (summary.length * 8) + 4, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      
      summary.forEach((item, index) => {
        const y = 50 + (index * 8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.label}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.value}`, 80, y);
      });
      
      currentY = 50 + (summary.length * 8) + 10;
    }
    
    // Table
    const tableHeaders = Object.keys(data[0]);
    const tableData = data.map(row => Object.values(row));
    
    autoTable(doc, {
      startY: currentY,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 },
      styles: { fontSize: 9 },
    });
    
    doc.save(`${filename}.pdf`);
  };

  const exportGlobalReport = async () => {
    try {
      // Fetch payments
      const paymentsRes = await fetch(`/api/reports/payments?from=${exportRange.from}&to=${exportRange.to}${exportRange.groupId ? `&groupId=${exportRange.groupId}` : ''}`);
      if (!paymentsRes.ok) throw new Error('Failed to fetch report data');
      const payments = await paymentsRes.json();
      
      // Fetch members to calculate unpaid status
      const membersRes = await fetch(`/api/members${exportRange.groupId ? `?groupId=${exportRange.groupId}` : ''}`);
      if (!membersRes.ok) throw new Error('Failed to fetch members');
      const members = await membersRes.json();

      const [fromYear, fromMonth] = exportRange.from.split('-').map(Number);
      const [toYear, toMonth] = exportRange.to.split('-').map(Number);

      const reportData: any[] = [];
      let totalAccrued = 0;
      let totalCollected = 0;

      members.forEach((member: Member) => {
        let currentYear = fromYear;
        let currentMonth = fromMonth;

        while (currentYear < toYear || (currentYear === toYear && currentMonth <= toMonth)) {
          const [sYear, sMonth] = member.start_date.split('-').map(Number);
          
          // Only count if member had started by this month
          if (currentYear > sYear || (currentYear === sYear && currentMonth >= sMonth)) {
            const monthPayments = payments.filter((p: any) => 
              p.member_id === member.id && 
              p.month === currentMonth && 
              p.year === currentYear
            );

            const paidAmount = monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
            const isPaid = paidAmount >= member.monthly_amount;
            
            totalAccrued += member.monthly_amount;
            totalCollected += paidAmount;

            const row = {
              'ID': member.code,
              'Name': member.name,
              'Month/Year': `${getMonthName(currentMonth)} ${currentYear}`,
              'Expected': `${getCurrencySymbol()} ${member.monthly_amount}`,
              'Paid': `${getCurrencySymbol()} ${paidAmount}`,
              'Status': paidAmount >= member.monthly_amount ? t('paid') : (paidAmount > 0 ? t('partial') : t('unpaid'))
            };

            if (exportRange.reportType === 'all') {
              reportData.push(row);
            } else if (exportRange.reportType === 'paid' && paidAmount > 0) {
              reportData.push(row);
            } else if (exportRange.reportType === 'unpaid' && paidAmount < member.monthly_amount) {
              reportData.push(row);
            }
          }

          currentMonth++;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }
      });
      
      if (reportData.length === 0) {
        alert('No records found for the selected criteria');
        return;
      }

      const selectedGroup = groups.find(g => g.id.toString() === exportRange.groupId);
      const groupName = selectedGroup ? selectedGroup.name : t('all_groups');
      const reportTypeName = exportRange.reportType === 'all' ? t('all_records') : (exportRange.reportType === 'paid' ? t('only_paid') : t('only_unpaid'));

      const summary = [
        { label: t('total_cost_deposited'), value: `${getCurrencySymbol()} ${totalCollected.toLocaleString()}` },
        { label: t('outstanding_dues'), value: `${getCurrencySymbol()} ${Math.max(0, totalAccrued - totalCollected).toLocaleString()}` }
      ];
      
      generatePDF(
        reportData, 
        `${reportTypeName} - ${groupName} (${exportRange.from} to ${exportRange.to})`, 
        `report_${exportRange.reportType}_${groupName.replace(/\s+/g, '_')}_${exportRange.from}_to_${exportRange.to}`,
        summary
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Export Error:', error);
      alert('Failed to generate report. Please check your connection or try a different criteria.');
    }
  };

  const exportMemberReport = (member: Member) => {
    const payments = (member as any).payments || [];
    const reportData = payments.map((p: Payment) => ({
      'Month/Year': `${getMonthName(p.month)} ${p.year}`,
      'Amount': `${getCurrencySymbol()} ${p.amount}`,
      'Method': p.method,
      'Date': new Date(p.date).toLocaleDateString(),
      'Notes': p.notes || '-'
    }));
    
    if (reportData.length === 0) {
      alert('No payment history found for this member');
      return;
    }

    const [sYear, sMonth] = member.start_date.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const dueDate = parseInt(settings.due_date || '15');

    let tempYear = sYear;
    let tempMonth = sMonth;
    let accrued = 0;
    const paid = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);

    while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
      if (tempYear === currentYear && tempMonth === currentMonth && currentDay <= dueDate) {
        // Not accrued yet
      } else {
        accrued += member.monthly_amount;
      }
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
      if (tempYear > currentYear + 1) break;
    }

    const summary = [
      { label: t('total_cost_deposited'), value: `${getCurrencySymbol()} ${paid.toLocaleString()}` },
      { label: t('outstanding_dues'), value: `${getCurrencySymbol()} ${Math.max(0, accrued - paid).toLocaleString()}` }
    ];
    
    generatePDF(reportData, `Payment History: ${member.name} (ID: ${member.code})`, `member_report_${member.code}`, summary);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting(key, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchGroups();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
      
      // Show startup if enabled and not seen in this session
      if (data.startup_enabled === 'true' && !sessionStorage.getItem('startup_seen')) {
        setShowStartup(true);
        sessionStorage.setItem('startup_seen', 'true');
      }
    } catch (error) {
      console.error('Settings Fetch Error:', error);
    }
  };

  const formatCurrencyLocal = (amount: number) => formatCurrency(amount, settings.currency || 'PKR');

  const t = (key: string) => {
    const lang = settings.language || 'en';
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    if (showSettings) {
      setLocalSettings({ ...settings });
    }
  }, [showSettings, settings]);

  const handleLocalSettingChange = (key: string, value: any) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
    updateSetting(key, value);
  };

  const saveAllSettings = async () => {
    setShowSettings(false);
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const payload = JSON.stringify({ key, value });
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (!res.ok) throw new Error('Failed to update setting');
      fetchSettings();
    } catch (error) {
      console.error('Update Setting Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Stats Fetch Error:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error('Groups Fetch Error:', error);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const res = await fetch(`/api/members?q=${q}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const openMemberProfile = async (id: number) => {
    const res = await fetch(`/api/members/${id}`);
    const data = await res.json();
    setSelectedMember(data);
    setView('members');
  };

  const handleAddPayment = async (e: any) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData);
      
      const data = {
        ...payload,
        member_id: selectedMember?.id,
        amount: Number(payload.amount),
        month: Number(payload.month),
        year: Number(payload.year)
      };

      let res;
      if (editingPayment) {
        res = await fetch(`/api/payments/${editingPayment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      if (!res.ok) throw new Error('Failed to save payment');
      
      setShowAddPayment(false);
      setEditingPayment(null);
      setActiveTimelineItem(null);
      if (selectedMember) openMemberProfile(selectedMember.id);
      fetchStats();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Error saving payment. Please try again.');
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      if (selectedMember) {
        // Refresh member data
        const mRes = await fetch(`/api/members/${selectedMember.id}`);
        const mData = await mRes.json();
        setSelectedMember(mData);
      }
      fetchStats();
      setActiveTimelineItem(null);
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  const handleSaveMember = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    
    const data = {
      ...payload,
      monthly_amount: Number(payload.monthly_amount),
      group_id: Number(payload.group_id) || selectedGroup?.id || groups[0]?.id,
      avatar: memberAvatar
    };

    if (editingMember) {
      await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    setShowAddMember(false);
    setEditingMember(null);
    setMemberAvatar(null);
    if (selectedGroup) fetchGroupMembers(selectedGroup.id);
    if (selectedMember) openMemberProfile(selectedMember.id);
    fetchStats();
  };

  const handleDeleteMember = async (memberId: number) => {
    const res = await fetch(`/api/members/${memberId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      setMemberToDelete(null);
      setSelectedMember(null);
      if (selectedGroup) fetchGroupMembers(selectedGroup.id);
      fetchStats();
      setView('dashboard');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete member');
      setMemberToDelete(null);
    }
  };

  const handleSaveGroup = async (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    
    if (editingGroup) {
      await fetch(`/api/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    } else {
      await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    }
    
    setShowAddGroup(false);
    setEditingGroup(null);
    if (selectedGroup && editingGroup && selectedGroup.id === editingGroup.id) {
      setSelectedGroup({ ...selectedGroup, name });
    }
    fetchGroups();
    fetchStats();
  };

  const handleDeleteGroup = async (groupId: number) => {
    const res = await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      fetchGroups();
      fetchStats();
      setGroupToDelete(null);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete group');
      setGroupToDelete(null);
    }
  };

  const fetchGroupMembers = async (groupId: number) => {
    const res = await fetch(`/api/members?groupId=${groupId}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, password } = Object.fromEntries(formData);
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      setIsAdmin(true);
      setView('dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const sendWhatsApp = (member: Member, type: 'thankyou' | 'reminder') => {
    const phone = member.whatsapp?.replace(/\D/g, '');
    if (!phone) return alert('No WhatsApp number found');
    
    let message = '';
    if (type === 'thankyou') {
      message = `Assalamu Alaikum ${member.name}. Thank you for paying your Chanda. Your contribution has been successfully recorded. May Allah reward you.`;
    } else {
      message = `Assalamu Alaikum ${member.name}. This is a friendly reminder for your monthly Chanda payment. Please contribute at your earliest convenience. JazakAllah.`;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const calculateDue = (member: Member, payments: Payment[]) => {
    if (!member.start_date) return { pending: 0, due: 0 };
    const start = parseISO(member.start_date + '-01');
    const now = new Date();
    let current = start;
    let totalDue = 0;
    
    const dueDate = parseInt(settings.due_date || '15');
    const currentDay = now.getDate();

    while (isBefore(current, now) || format(current, 'yyyy-MM') === format(now, 'yyyy-MM')) {
      const month = current.getMonth() + 1;
      const year = current.getFullYear();

      // If it's the current month and we haven't reached the due date yet, don't count it as "Due" yet
      if (year === now.getFullYear() && month === (now.getMonth() + 1) && currentDay <= dueDate) {
        current = new Date(current.setMonth(current.getMonth() + 1));
        continue;
      }

      const monthPayments = payments.filter(p => p.month === month && p.year === year);
      const totalPaidForMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaidForMonth < member.monthly_amount) {
        totalDue += (member.monthly_amount - totalPaidForMonth);
      }
      current = new Date(current.setMonth(current.getMonth() + 1));
    }
    return { due: totalDue };
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
          <div className="w-8 h-8 blue-gradient rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
            {settings.app_logo ? (
              <img src={settings.app_logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{(settings.app_name || 'N').charAt(0)}</span>
            )}
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden sm:block">{settings.app_name || 'Nur Chanda'}</h1>
        </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('search')}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Search className="w-5 h-5 text-slate-500" />
          </button>
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              ADMIN
            </div>
          )}
        </div>
      </header>

      {/* --- Sidebar Overlay --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 p-6 flex flex-col gap-8 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 blue-gradient rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                    {settings.app_logo ? (
                      <img src={settings.app_logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">{(settings.app_name || 'M').charAt(0)}</span>
                    )}
                  </div>
                  <h2 className="font-bold text-xl">{settings.app_name || 'Masjid-e-Hussain'}</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)}><X /></button>
              </div>

              <nav className="flex flex-col gap-2">
                <NavItem active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} icon={LayoutDashboard} label={t('dashboard')} />
                <NavItem active={view === 'groups'} onClick={() => { setView('groups'); setIsSidebarOpen(false); }} icon={Users} label={t('groups')} />
                <NavItem active={view === 'search'} onClick={() => { setView('search'); setIsSidebarOpen(false); }} icon={Search} label={t('search')} />
                <NavItem active={false} onClick={() => { setShowExportModal(true); setIsSidebarOpen(false); }} icon={Download} label={t('export_reports')} />
                {isAdmin && (
                  <>
                    <div className="h-px bg-slate-100 my-2" />
                    <NavItem active={false} onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }} icon={Settings} label={t('payment_settings')} />
                    <NavItem active={false} onClick={() => { setIsAdmin(false); setView('dashboard'); setIsSidebarOpen(false); }} icon={LogOut} label={t('logout')} />
                  </>
                )}
                {!isAdmin && (
                  <NavItem active={view === 'admin'} onClick={() => { setView('admin'); setIsSidebarOpen(false); }} icon={ShieldCheck} label={isAdmin ? t('admin_panel') : t('admin_login')} />
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content --- */}
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full pb-24">
        
        {view === 'dashboard' && (
          <div className="space-y-6">
            <ScrollingBanner stats={stats} t={t} getCurrencySymbol={getCurrencySymbol} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title={t('total_collected')} value={stats?.totalCollected || 0} icon={Wallet} trend={12} isCurrency currency={getCurrencySymbol()} />
              <StatCard title={t('total_members')} value={stats?.totalMembers || 0} icon={Users} trend={5} trendColor="text-primary-600" />
              <StatCard title={t('active_groups')} value={stats?.activeGroups || 0} icon={LayoutDashboard} />
            </div>

            <Card title={t('monthly_trend')} subtitle={t('last_6_months')}>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(m) => getMonthName(m).substring(0, 3)} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(v) => `${getCurrencySymbol()} ${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(v: number) => [formatCurrency(v, settings.currency || 'PKR'), 'Collected']}
                      labelFormatter={(m) => getMonthName(Number(m))}
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorAmount)"
                      dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Recent Groups" action={<button onClick={() => setView('groups')} className="text-primary-600 text-xs font-bold">View All</button>}>
                <div className="space-y-3">
                  {groups.slice(0, 3).map(group => (
                    <div 
                      key={group.id}
                      onClick={() => { setSelectedGroup(group); fetchGroupMembers(group.id); setView('groups'); }}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold">
                          {group.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{group.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{group.memberCount} Members</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Quick Actions">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setView('search')}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all group"
                  >
                    <Search className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                    <span className="text-xs font-bold">Search</span>
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAddGroup(true)}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all group"
                    >
                      <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                      <span className="text-xs font-bold">Add Group</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all group"
                  >
                    <Download className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                    <span className="text-xs font-bold">Report</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all group">
                    <Clock className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                    <span className="text-xs font-bold">History</span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'groups' && (
          <div className="space-y-6">
            {!selectedGroup ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Donation Groups</h2>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAddGroup(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20"
                    >
                      <Plus className="w-4 h-4" /> New Group
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map(group => (
                    <Card 
                      key={group.id} 
                      className="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group/card"
                      onClick={() => { setSelectedGroup(group); fetchGroupMembers(group.id); }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 green-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {group.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{group.name}</h3>
                            <p className="text-xs text-slate-500">Created {new Date(group.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGroup(group);
                                setShowAddGroup(true);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg text-blue-600"
                              title="Edit Group"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupToDelete(group.id);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg text-rose-600"
                              title="Delete Group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Members</p>
                          <p className="text-lg font-bold"><Counter value={group.memberCount} /></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Collected</p>
                          <p className="text-lg font-bold text-primary-600"><Counter value={group.totalCollected || 0} prefix={`${getCurrencySymbol()} `} /></p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedGroup(null)}
                  className="text-slate-500 flex items-center gap-2 text-sm font-medium hover:text-slate-800"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back to Groups
                </button>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedGroup.name}</h2>
                      <p className="text-slate-500 text-sm">Managing {searchResults.length} members in this group</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingGroup(selectedGroup);
                            setShowAddGroup(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-blue-600"
                          title="Edit Group"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setGroupToDelete(selectedGroup.id);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-rose-600"
                          title="Delete Group"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAddMember(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Add Member
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search members in this group..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  {searchResults.map(member => (
                    <div 
                      key={member.id}
                      onClick={() => openMemberProfile(member.id)}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                          {member.avatar ? (
                            <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{member.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">ID: {member.code}</span>
                            <span className="text-xs text-primary-600 font-bold">
                              <Counter value={member.monthly_amount} prefix="Rs " />/mo
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                          <span className="text-xs font-bold text-primary-600">Paid</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'members' && selectedMember && (
          <div className="space-y-6">
            <button 
              onClick={() => setView('groups')}
              className="text-slate-500 flex items-center gap-2 text-sm font-medium hover:text-slate-800"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Group
            </button>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 blue-gradient opacity-10 rounded-bl-full" />
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden ring-4 ring-primary-50">
                  {selectedMember.avatar ? (
                    <img src={selectedMember.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-full">
                        ID: {selectedMember.code}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingMember(selectedMember);
                              setMemberAvatar(selectedMember.avatar);
                              setShowAddMember(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600"
                            title="Edit Member"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setMemberToDelete(selectedMember.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-1">
                    <Users className="w-3.5 h-3.5" /> {selectedMember.groupName}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Wallet className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-bold">
                        <Counter value={selectedMember.monthly_amount} prefix="Rs " />/{t('per_month')}
                      </span>
                    </div>
                    {selectedMember.whatsapp && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MessageCircle className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-bold">{selectedMember.whatsapp}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => exportMemberReport(selectedMember)}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" /> {t('export_pdf')}
                    </button>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const currentMonth = new Date().getMonth() + 1;
                          const currentYear = new Date().getFullYear();
                          const existing = (selectedMember as any).payments?.find((p: Payment) => p.month === currentMonth && p.year === currentYear);
                          
                          if (existing) {
                            setEditingPayment(existing);
                            setPaymentAmount(existing.amount.toString());
                          } else {
                            setEditingPayment(null);
                            setPaymentAmount(selectedMember.monthly_amount.toString());
                          }
                          setPaymentMonth(currentMonth);
                          setPaymentYear(currentYear);
                          setShowAddPayment(true);
                        }}
                        className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
                      >
                        {t('add_fund')}
                      </button>
                      <button 
                        onClick={() => {
                          const nextMonthDate = new Date();
                          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
                          const nextMonth = nextMonthDate.getMonth() + 1;
                          const nextYear = nextMonthDate.getFullYear();
                          
                          const existing = (selectedMember as any).payments?.find((p: Payment) => p.month === nextMonth && p.year === nextYear);
                          
                          if (existing) {
                            setEditingPayment(existing);
                            setPaymentAmount(existing.amount.toString());
                          } else {
                            setEditingPayment(null);
                            setPaymentAmount(selectedMember.monthly_amount.toString());
                          }
                          setPaymentMonth(nextMonth);
                          setPaymentYear(nextYear);
                          setShowAddPayment(true);
                        }}
                        className="flex-1 bg-primary-100 text-primary-700 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-primary-200 transition-all"
                      >
                        {t('advance')}
                      </button>
                    </div>
                    <button 
                      onClick={() => sendWhatsApp(selectedMember, 'reminder')}
                      className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      {t('send_reminder')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Card 
              title={t('payment_timeline')} 
              subtitle={`${t('status_for_year')} ${timelineYear}`}
              action={
                <div className="flex items-center gap-2">
                  <select 
                    value={timelineYear} 
                    onChange={(e) => setTimelineYear(Number(e.target.value))}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              }
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {MONTHS.map((monthName, index) => {
                  const monthNum = index + 1;
                  const year = timelineYear;
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  
                  // Filter by start date
                  if (selectedMember.start_date) {
                    const start = parseISO(selectedMember.start_date + '-01');
                    const boxDate = new Date(year, index, 1);
                    if (isBefore(boxDate, start)) return null;
                  }

                  const payments = (selectedMember as any).payments || [];
                  const monthPayments = payments.filter((p: Payment) => p.month === monthNum && p.year === year);
                  const totalPaid = monthPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
                  
                  const dueDate = parseInt(settings.due_date || '15');
                  const currentDay = new Date().getDate();

                  let status = 'future';
                  let colorClass = 'bg-slate-50 text-slate-400 border-slate-100';
                  let label = t('upcoming');

                  if (totalPaid >= selectedMember.monthly_amount) {
                    status = 'paid';
                    colorClass = 'bg-primary-50 text-primary-700 border-primary-100 ring-1 ring-primary-500/20';
                    label = t('paid');
                  } else if (totalPaid > 0) {
                    status = 'half';
                    colorClass = 'bg-yellow-50 text-yellow-600 border-yellow-100 ring-1 ring-yellow-500/20';
                    label = t('partial');
                  } else if (year < currentYear || (year === currentYear && monthNum < currentMonth)) {
                    status = 'due';
                    colorClass = 'bg-rose-50 text-rose-700 border-rose-100 ring-1 ring-rose-500/20';
                    label = t('due');
                  } else if (year === currentYear && monthNum === currentMonth) {
                    if (currentDay > dueDate) {
                      status = 'due';
                      colorClass = 'bg-rose-50 text-rose-700 border-rose-100 ring-1 ring-rose-500/20';
                      label = t('due');
                    } else {
                      status = 'pending';
                      colorClass = 'bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-500/20';
                      label = t('pending');
                    }
                  }

                  const isActive = activeTimelineItem?.month === monthNum && activeTimelineItem?.year === year;

                  return (
                    <div 
                      key={monthName}
                      onClick={() => {
                        if (!isAdmin) {
                          alert('Please login as admin to manage payments');
                          setView('admin');
                          return;
                        }
                        if (isActive) {
                          setActiveTimelineItem(null);
                        } else {
                          setActiveTimelineItem({ month: monthNum, year });
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all relative group h-20",
                        isAdmin ? "cursor-pointer" : "cursor-default",
                        isActive ? "ring-2 ring-primary-500 ring-offset-2 scale-105 z-10" : "hover:scale-[1.02]",
                        colorClass
                      )}
                    >
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-primary-600 rounded-2xl flex items-center justify-center gap-2 z-20 shadow-xl"
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const existingPayment = monthPayments[0];
                                if (existingPayment) {
                                  setEditingPayment(existingPayment);
                                  setPaymentAmount(existingPayment.amount.toString());
                                } else {
                                  setEditingPayment(null);
                                  setPaymentAmount(selectedMember.monthly_amount.toString());
                                }
                                setPaymentMonth(monthNum);
                                setPaymentYear(year);
                                setShowAddPayment(true);
                              }}
                              className="bg-white text-primary-600 p-2 rounded-xl font-bold text-[10px] flex items-center gap-1 hover:bg-slate-50 transition-colors"
                            >
                              {totalPaid > 0 ? <Pencil className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              {totalPaid > 0 ? "Edit" : "Add"}
                            </button>
                            {totalPaid > 0 && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePayment(monthPayments[0].id);
                                }}
                                className="bg-rose-600 text-white p-2 rounded-xl hover:bg-rose-700 transition-colors"
                                title="Delete Payment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTimelineItem(null);
                              }}
                              className="bg-primary-700 text-white p-2 rounded-xl hover:bg-primary-800 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1">{monthName.substring(0, 3)}</span>
                      <span className="text-[10px] font-medium opacity-80">{label}</span>
                      {totalPaid > 0 && (
                        <span className="text-[9px] font-bold mt-1"><Counter value={totalPaid} prefix={`${getCurrencySymbol()} `} /></span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Paid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Due</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pending</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card title="Payment History">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="pb-3 text-[10px] uppercase font-bold text-slate-400">Month/Year</th>
                          <th className="pb-3 text-[10px] uppercase font-bold text-slate-400">Amount</th>
                          <th className="pb-3 text-[10px] uppercase font-bold text-slate-400">Method</th>
                          <th className="pb-3 text-[10px] uppercase font-bold text-slate-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(selectedMember as any).payments?.map((p: Payment) => (
                          <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4">
                              <span className="text-sm font-bold text-slate-700">{getMonthName(p.month)} {p.year}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-sm font-bold text-primary-600">{formatCurrency(p.amount, settings.currency || 'PKR')}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{p.method}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
                                {isAdmin && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        setEditingPayment(p);
                                        setPaymentMonth(p.month);
                                        setPaymentYear(p.year);
                                        setShowAddPayment(true);
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                      <Plus className="w-3.5 h-3.5 rotate-45" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePayment(p.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!selectedMember as any).payments?.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No payments recorded yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card title="Financial Summary">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Total Paid</span>
                      <span className="text-lg font-bold text-primary-600">
                        <Counter value={(selectedMember as any).payments?.reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0} prefix="Rs " />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Pending</span>
                      <span className="text-lg font-bold text-amber-600">Rs 0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Due</span>
                      <span className="text-lg font-bold text-rose-600">
                        <Counter value={calculateDue(selectedMember, (selectedMember as any).payments || []).due} prefix={`${getCurrencySymbol()} `} />
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Reliability Score</span>
                      <span className="text-sm font-bold text-primary-600">98%</span>
                    </div>
                  </div>
                </Card>

                <Card title="Member Details">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Address</p>
                      <p className="text-sm text-slate-700">{selectedMember.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Started Paying</p>
                      <p className="text-sm text-slate-700">{selectedMember.start_date}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Search Members</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, 5-digit ID, or phone..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-lg"
              />
            </div>

            <div className="space-y-3">
              {searchResults.length > 0 ? (
                searchResults.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => openMemberProfile(member.id)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{member.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">ID: {member.code}</span>
                          <span className="text-[10px] text-primary-600 font-bold"><Counter value={member.monthly_amount} prefix={`${getCurrencySymbol()} `} />/mo</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                ))
              ) : searchQuery.length > 2 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-800">No members found</h3>
                  <p className="text-sm text-slate-500">Try searching with a different name or ID code</p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Enter at least 3 characters to search
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'admin' && !isAdmin && (
          <div className="max-w-md mx-auto mt-12">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 blue-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('admin_login')}</h2>
                <p className="text-sm text-slate-500">{t('admin_panel_desc')}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Username</label>
                  <input 
                    name="username"
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all mt-4"
                >
                  Sign In
                </button>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* --- Modals --- */}
      <AnimatePresence>
        {showStartup && (
          <StartupAnimation settings={settings} onComplete={() => setShowStartup(false)} />
        )}

        {showSettings && localSettings && (
          <Modal title={t('settings')} onClose={() => setShowSettings(false)}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <section className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> {t('app_settings')}
                </h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('app_name')}</label>
                  <input 
                    type="text" 
                    value={localSettings.app_name}
                    onChange={(e) => handleLocalSettingChange('app_name', e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('app_logo')}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                      {localSettings.app_logo ? (
                        <img src={localSettings.app_logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleLocalSettingChange('app_logo', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4" /> {t('admin_profile')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('username')}</label>
                    <input 
                      type="text" 
                      value={localSettings.admin_username}
                      onChange={(e) => handleLocalSettingChange('admin_username', e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('password')}</label>
                    <input 
                      type="password" 
                      value={localSettings.admin_password}
                      onChange={(e) => handleLocalSettingChange('admin_password', e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> {t('payment_settings')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('currency')}</label>
                    <select 
                      value={localSettings.currency || 'PKR'}
                      onChange={(e) => handleLocalSettingChange('currency', e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
                    >
                      <option value="PKR">PKR (₨)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="SAR">SAR (SR)</option>
                      <option value="AED">AED (dh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('due_date')}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31"
                      value={localSettings.due_date}
                      onChange={(e) => handleLocalSettingChange('due_date', e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('language')}</label>
                <select 
                  value={localSettings.language}
                  onChange={(e) => handleLocalSettingChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> {t('startup_settings')}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{t('startup_enabled')}</span>
                  <button 
                    onClick={() => handleLocalSettingChange('startup_enabled', localSettings.startup_enabled === 'true' ? 'false' : 'true')}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      localSettings.startup_enabled === 'true' ? "bg-primary-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                      localSettings.startup_enabled === 'true' ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('startup_title')}</label>
                  <input 
                    type="text" 
                    value={localSettings.startup_title}
                    onChange={(e) => handleLocalSettingChange('startup_title', e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('startup_credit')}</label>
                  <input 
                    type="text" 
                    value={localSettings.startup_credit}
                    onChange={(e) => handleLocalSettingChange('startup_credit', e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('startup_image')}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                      {localSettings.startup_image ? (
                        <img src={localSettings.startup_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleLocalSettingChange('startup_image', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('startup_duration')}</label>
                    <input 
                      type="number" 
                      value={localSettings.startup_duration}
                      onChange={(e) => handleLocalSettingChange('startup_duration', e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('startup_bg')}</label>
                    <input 
                      type="color" 
                      value={localSettings.startup_bg_color}
                      onChange={(e) => handleLocalSettingChange('startup_bg_color', e.target.value)}
                      className="w-full h-9 p-1 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </section>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {t('done')}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showExportModal && (
          <Modal title={t('export_pdf')} onClose={() => setShowExportModal(false)}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">{t('date_range')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('from')}</label>
                  <input 
                    type="month" 
                    value={exportRange.from}
                    onChange={(e) => setExportRange({ ...exportRange, from: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('to')}</label>
                  <input 
                    type="month" 
                    value={exportRange.to}
                    onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('select_group')}</label>
                <select 
                  value={exportRange.groupId}
                  onChange={(e) => setExportRange({ ...exportRange, groupId: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                >
                  <option value="">{t('all_groups')}</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('report_type')}</label>
                <select 
                  value={exportRange.reportType}
                  onChange={(e) => setExportRange({ ...exportRange, reportType: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                >
                  <option value="all">{t('all_records')}</option>
                  <option value="paid">{t('only_paid')}</option>
                  <option value="unpaid">{t('only_unpaid')}</option>
                </select>
              </div>
              <button 
                onClick={exportGlobalReport}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> {t('download')}
              </button>
            </div>
          </Modal>
        )}

        {showAddGroup && (
          <Modal title={editingGroup ? "Edit Group" : "Create New Group"} onClose={() => { setShowAddGroup(false); setEditingGroup(null); }}>
            <form key={editingGroup?.id || 'new'} onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Group Name</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingGroup?.name}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="e.g. Madrassa Students" 
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">
                {editingGroup ? "Update Group" : "Create Group"}
              </button>
            </form>
          </Modal>
        )}

        {groupToDelete && (
          <Modal title="Confirm Delete" onClose={() => setGroupToDelete(null)}>
            <div className="space-y-6">
              <p className="text-slate-600">Are you sure you want to delete this group? All members must be removed first.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteGroup(groupToDelete);
                    if (selectedGroup && selectedGroup.id === groupToDelete) {
                      setSelectedGroup(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showAddMember && (
          <Modal title={editingMember ? "Edit Member" : "Add New Member"} onClose={() => { setShowAddMember(false); setEditingMember(null); }}>
            <form onSubmit={handleSaveMember} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                    {memberAvatar ? (
                      <img src={memberAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMemberAvatar(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input name="name" required defaultValue={editingMember?.name} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Monthly Amount</label>
                  <input name="monthly_amount" type="number" required defaultValue={editingMember?.monthly_amount} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">WhatsApp</label>
                  <input name="whatsapp" placeholder="+92..." defaultValue={editingMember?.whatsapp} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Group</label>
                <select name="group_id" defaultValue={editingMember?.group_id || selectedGroup?.id} className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl">
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date (Month/Year)</label>
                <input name="start_date" type="month" required defaultValue={editingMember?.start_date} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Address</label>
                <textarea name="address" defaultValue={editingMember?.address} className="w-full px-4 py-3 border border-slate-200 rounded-xl" rows={2} />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">
                {editingMember ? "Update Member" : "Save Member"}
              </button>
            </form>
          </Modal>
        )}

        {memberToDelete && (
          <Modal title="Confirm Delete Member" onClose={() => setMemberToDelete(null)}>
            <div className="space-y-6">
              <p className="text-slate-600">Are you sure you want to delete this member? All their payment history will be permanently removed.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteMember(memberToDelete)}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showAddPayment && (
          <Modal title={editingPayment ? "Edit Payment" : "Record Payment"} onClose={() => { setShowAddPayment(false); setEditingPayment(null); }}>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Month</label>
                  <select 
                    name="month" 
                    value={paymentMonth} 
                    onChange={(e) => setPaymentMonth(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Year</label>
                  <select 
                    name="year" 
                    value={paymentYear} 
                    onChange={(e) => setPaymentYear(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Amount Paid</label>
                  <button 
                    type="button"
                    onClick={() => setPaymentAmount(selectedMember?.monthly_amount.toString() || '')}
                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700 underline"
                  >
                    Set to Standard ({formatCurrency(selectedMember?.monthly_amount || 0, settings.currency || 'PKR')})
                  </button>
                </div>
                <input 
                  name="amount" 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required 
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Method</label>
                <select 
                  name="method" 
                  defaultValue={editingPayment ? editingPayment.method : "Cash"}
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online Transfer</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Date</label>
                <input 
                  name="date" 
                  type="date" 
                  defaultValue={editingPayment ? editingPayment.date : new Date().toISOString().split('T')[0]} 
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20" 
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all">
                {editingPayment ? "Update Payment" : "Confirm Payment"}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- Bottom Nav (Mobile) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between lg:hidden z-40">
        <BottomNavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={LayoutDashboard} label="Home" />
        <BottomNavItem active={view === 'groups'} onClick={() => setView('groups')} icon={Users} label="Groups" />
        <BottomNavItem active={view === 'search'} onClick={() => setView('search')} icon={Search} label="Search" />
        <BottomNavItem active={view === 'admin'} onClick={() => setIsSidebarOpen(true)} icon={Menu} label="More" />
      </nav>
    </div>
  );
}

// --- Helper Components ---

const BottomNavItem = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all",
      active ? "text-primary-600" : "text-slate-400"
    )}
  >
    <Icon className={cn("w-6 h-6", active && "scale-110")} />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);
