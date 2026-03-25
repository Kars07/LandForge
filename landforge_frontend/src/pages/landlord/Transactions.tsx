import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTransactions } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionStage } from '@/lib/types';

const stages: { key: TransactionStage; label: string }[] = [
  { key: 'awaiting_payment', label: 'Awaiting Payment' },
  { key: 'payment_received', label: 'Payment Received' },
  { key: 'escrow_holding', label: 'Escrow Holding' },
  { key: 'documents_completed', label: 'Documents Completed' },
  { key: 'ready_for_release', label: 'Ready for Release' },
  { key: 'funds_released', label: 'Funds Released' },
];

const stageIndex = (s: TransactionStage) => stages.findIndex(st => st.key === s);

const LandlordTransactions = () => {
  const { user } = useAuth();
  const transactions = getTransactions().filter(t => t.landlordId === user?.id || t.landlordId === 'landlord-demo-001');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground font-body text-sm">{transactions.length} transactions</p>
      </div>

      {transactions.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground font-body">No transactions yet</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {transactions.map(tx => {
            const current = stageIndex(tx.stage);
            return (
              <Card key={tx.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-bold text-lg">{tx.propertyTitle}</h3>
                      <p className="text-sm text-muted-foreground font-body">Buyer: {tx.buyerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary font-display">₦{tx.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground font-body">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {stages.map((stage, i) => (
                      <div key={stage.key} className="flex items-center flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center max-w-[80px] font-body ${i <= current ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </span>
                        </div>
                        {i < stages.length - 1 && (
                          <div className={`h-0.5 w-8 mx-1 ${i < current ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LandlordTransactions;
