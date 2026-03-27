import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, HandCoins, Building2, Clock, CheckCircle, TrendingUp, Wallet, ArrowUpRight, CreditCard, Loader2, X, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiProperties, apiPayments, apiWallet, apiWithdrawals } from '@/lib/apiClient';
import { createVirtualAccount, initiateTransfer, VirtualAccountResult } from '@/lib/interswitchService';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-info/10 text-info',
  ai_review: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  live: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  sold: 'bg-accent/10 text-accent',
  rented: 'bg-accent/10 text-accent',
};

const BANKS = [
  { name: 'Access Bank', code: 'ABP' },
  { name: 'GTBank', code: 'GTB' },
  { name: 'First Bank', code: 'FBN' },
  { name: 'UBA', code: 'UBA' },
  { name: 'Zenith Bank', code: 'ZNB' },
  { name: 'Stanbic IBTC', code: 'SIB' },
  { name: 'FCMB', code: 'FCM' },
  { name: 'Fidelity Bank', code: 'FBP' },
  { name: 'Sterling Bank', code: 'STB' },
  { name: 'Wema Bank', code: 'WMB' },
  { name: 'Polaris Bank', code: 'PLB' },
  { name: 'Kuda Bank', code: 'KDB' },
  { name: 'Opay', code: 'OPA' },
];

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      apiProperties.list({ landlordId: user.id }),
      apiPayments.list({ landlordId: user.id }),
      apiWallet.get(user.id).then(w => {
        if (w?.balance !== undefined) setWalletBalance(w.balance);
        if (w?.iswAccountNumber) {
          setVirtualAccount({
            success: true,
            accountNumber: w.iswAccountNumber,
            accountName: w.iswAccountName,
            bankName: w.iswBankName,
            raw: { payableId: w.iswPayableId, merchantCode: w.iswMerchantCode }
          });
        }
      }).catch(() => {}),
    ]).then(([props, pays]) => {
      setProperties(props);
      setPayments(pays);
    }).catch(() => {}).finally(() => setIsDataLoading(false));
  }, [user?.id]);

  // Virtual Account state
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountResult | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showVAModal, setShowVAModal] = useState(false);

  // Wallet / Transfer state
  const [walletBalance, setWalletBalance] = useState(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ bankCode: 'GTB', accountNumber: '', amount: '' });

  const handleProvisionAccount = async () => {
    setIsProvisioning(true);
    toast.info('Provisioning Interswitch Card 360 Escrow Account...', { duration: 6000 });
    try {
      const result = await createVirtualAccount({
        firstName: user?.firstName || 'Land',
        lastName: user?.lastName || 'Lord',
        userId: user?.id || '123',
        phone: '08000000000',
        email: user?.email || 'landlord@landforge.io',
      });
      setVirtualAccount(result);
      setShowVAModal(true);
      toast.success(result.demo ? '✅ Escrow account provisioned (Demo Mode)!' : '✅ Interswitch Escrow Account created successfully!');
      // Persist wallet details to MongoDB
      apiWallet.provision({
        landlordId: user?.id,
        iswAccountNumber: result.accountNumber,
        iswAccountName: result.accountName,
        iswBankName: result.bankName,
        iswPayableId: result.raw?.payableId,
        iswMerchantCode: result.raw?.merchantCode,
      }).catch(() => {});
    } catch (e: any) {
      toast.error('Provisioning failed: ' + e.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.accountNumber || !withdrawForm.bankCode) {
      toast.error('Please fill in all withdrawal details');
      return;
    }
    const amount = parseFloat(withdrawForm.amount) || walletBalance;
    if (amount > walletBalance) {
      toast.error(`Amount exceeds balance of ₦${walletBalance.toLocaleString()}`);
      return;
    }

    setIsWithdrawing(true);
    toast.info('Initiating bank transfer via Interswitch...', { duration: 6000 });
    const bankName = BANKS.find(b => b.code === withdrawForm.bankCode)?.name || 'Bank';

    try {
      const result = await initiateTransfer({
        destAccount: withdrawForm.accountNumber,
        destBankCode: withdrawForm.bankCode,
        amount,
        narration: `LandForge Property Settlement - ${user?.firstName} ${user?.lastName}`,
        sourceName: 'LandForge Escrow',
      });

      if (result.success) {
        toast.success(result.demo
          ? `✅ [Demo] ₦${amount.toLocaleString()} marked as sent to ${bankName}`
          : `✅ ₦${amount.toLocaleString()} transferred to ${bankName}! Ref: ${result.transactionReference}`
        );
        // Persist withdrawal to MongoDB
        apiWithdrawals.record({
          landlordId: user?.id,
          amount,
          destBank: bankName,
          destBankCode: withdrawForm.bankCode,
          destAccount: withdrawForm.accountNumber,
          narration: `LandForge Property Settlement - ${user?.firstName} ${user?.lastName}`,
          iswRef: result.transactionReference,
          status: 'success',
          iswResponse: result,
        }).catch(() => {});
        setWalletBalance(prev => prev - amount);
        setShowWithdrawModal(false);
        setWithdrawForm({ bankCode: 'GTB', accountNumber: '', amount: '' });
      } else {
        toast.error('Transfer could not be completed: ' + result.message);
      }
    } catch (e: any) {
      toast.error('Transfer error: ' + e.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const stats = [
    { label: 'Total Listings', value: properties.length, icon: Building2, color: 'text-primary' },
    { label: 'Active', value: properties.filter(p => p.status === 'active' || p.status === 'live').length, icon: CheckCircle, color: 'text-success' },
    { label: 'Pending Review', value: properties.filter(p => ['submitted', 'ai_review'].includes(p.status)).length, icon: Clock, color: 'text-warning' },
    { label: 'Payments Received', value: payments.length, icon: MessageSquare, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground font-body text-sm">Here's what's happening with your properties</p>
        </div>
        <Link to="/landlord/listings/new">
          <Button className="gradient-hero text-primary-foreground border-0">
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground font-body">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Escrow Wallet */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Interswitch Escrow Wallet
            {virtualAccount && (
              <Badge className="bg-success/10 text-success text-xs ml-auto">
                {virtualAccount.demo ? 'Demo Mode' : 'Live'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-body">Available Balance</p>
              <p className="text-4xl font-bold font-display text-foreground">₦{walletBalance.toLocaleString()}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={handleProvisionAccount}
                disabled={isProvisioning}
              >
                {isProvisioning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                {virtualAccount ? 'View Account' : 'Provision Card 360'}
              </Button>
              <Button
                className="flex-1 sm:flex-none gradient-hero text-primary-foreground border-0"
                onClick={() => setShowWithdrawModal(true)}
                disabled={walletBalance <= 0}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw to Bank
              </Button>
            </div>
          </div>

          {/* Virtual account details if provisioned */}
          {virtualAccount && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground font-body">Account Number</p>
                <p className="font-bold font-mono text-sm">{virtualAccount.accountNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground font-body">Account Name</p>
                <p className="font-bold text-sm">{virtualAccount.accountName}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground font-body">Bank</p>
                <p className="font-bold text-sm">{virtualAccount.bankName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/landlord/listings/new"><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Property</Button></Link>
            <Link to="/landlord/inquiries"><Button variant="outline" size="sm"><MessageSquare className="w-4 h-4 mr-1" /> Inquiries</Button></Link>
            <Link to="/landlord/offers"><Button variant="outline" size="sm"><HandCoins className="w-4 h-4 mr-1" /> Offers</Button></Link>
            <Link to="/landlord/transactions"><Button variant="outline" size="sm"><TrendingUp className="w-4 h-4 mr-1" /> Transactions</Button></Link>
          </CardContent>
        </Card>

        {/* Listing Status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">My Listings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {properties.length === 0 && (
              <p className="text-sm text-muted-foreground font-body text-center py-4">No listings yet. Add your first property!</p>
            )}
            {properties.slice(0, 5).map(prop => (
              <Link key={prop.id} to={`/landlord/listings/${prop.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <img src={prop.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" width={40} height={40} />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{prop.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{prop.city}, {prop.state}</p>
                  </div>
                </div>
                <Badge className={`text-xs font-body capitalize ${statusColors[prop.status] || ''}`}>
                  {prop.status.replace('_', ' ')}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Virtual Account Modal */}
      <Dialog open={showVAModal} onOpenChange={setShowVAModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Interswitch Escrow Account {virtualAccount?.demo && <Badge className="bg-warning/10 text-warning text-xs">Demo</Badge>}
            </DialogTitle>
          </DialogHeader>
          {virtualAccount && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-accent text-white space-y-3">
                <p className="text-xs opacity-75">Card 360 Virtual Account</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{virtualAccount.accountNumber}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75">Account Holder</p>
                    <p className="font-bold">{virtualAccount.accountName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Issuer</p>
                    <p className="font-bold text-sm">INTERSWITCH</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{virtualAccount.bankName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Card PAN</span>
                  <span className="font-mono">{virtualAccount.cardPan || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-success/10 text-success">Active</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Buyers pay into this account. Funds are held in escrow until property transfer is confirmed on-chain, then you can withdraw to your bank.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdrawal Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Withdraw Escrow Funds
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground font-body">Available Balance</p>
              <p className="text-2xl font-bold">₦{walletBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="font-body text-sm">Select Bank</Label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
                  value={withdrawForm.bankCode}
                  onChange={e => setWithdrawForm(f => ({ ...f, bankCode: e.target.value }))}
                >
                  {BANKS.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="font-body text-sm">Account Number</Label>
                <Input
                  className="mt-1 font-mono"
                  placeholder="0123456789"
                  maxLength={10}
                  value={withdrawForm.accountNumber}
                  onChange={e => setWithdrawForm(f => ({ ...f, accountNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label className="font-body text-sm">Amount (₦) — leave empty to withdraw all</Label>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder={walletBalance.toString()}
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            <Button
              className="w-full gradient-hero text-primary-foreground border-0"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Transfer...</> : 'Initiate Bank Transfer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordDashboard;
