import { create } from 'zustand';
import { WalletTransaction, TransactionType } from '../types/wallet';
import { useAuthStore } from './useAuthStore';

interface WalletState {
  availableBalance: number;
  pendingCredits: number;
  earnedAsOwner: number;
  earnedAsGuard: number;
  transactions: WalletTransaction[];

  // Actions
  addFunds: (amount: number, method?: string) => void;
  deductFunds: (amount: number, title: string, bookingId?: string) => boolean;
  creditRefund: (amount: number, bookingId: string, title?: string) => void;
  creditOwnerEarning: (amount: number, title: string) => void;
  creditGuardIncentive: (amount: number, title: string) => void;
  getSummary: () => {
    totalCredits: number;
    totalDebits: number;
    pendingCredits: number;
  };
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_01',
    txNumber: 'TXN-CP-9941-IND',
    type: 'parking_payment',
    title: 'Greenwood Palms — Bay B-14',
    amount: -195.00,
    date: 'Today, 06:15 PM',
    status: 'completed',
    category: 'Parking Pass',
    relatedBookingId: 'bk_live_blr_9081',
    paymentMethodUsed: 'CommunityPark Wallet',
    referenceNumber: 'TXN-CP-9941-IND',
    note: 'Debited for active reservation at Greenwood Palms Gate 2.',
    isDemo: true,
  },
  {
    id: 'tx_02',
    txNumber: 'REF-CP-7712-IND',
    type: 'parking_refund',
    title: 'Refund: Metro Rail Park & Ride',
    amount: +180.00,
    date: '03 Nov 2026',
    status: 'completed',
    category: 'Booking Refund',
    relatedBookingId: 'bk_cancelled_01',
    paymentMethodUsed: 'Wallet Credit',
    referenceNumber: 'REF-CP-7712-IND',
    note: 'Driver cancelled reservation before validity start. 100% refund credited.',
    isDemo: true,
  },
  {
    id: 'tx_03',
    txNumber: 'OWN-CP-4401-MUM',
    type: 'owner_earning',
    title: 'Owner Earning: Bandra Carter Road Portico',
    amount: +450.00,
    date: '02 Nov 2026',
    status: 'completed',
    category: 'Host Payout',
    referenceNumber: 'OWN-CP-4401-MUM',
    note: '6-hour guest booking completed successfully in driveway space.',
    isDemo: true,
  },
  {
    id: 'tx_04',
    txNumber: 'GRD-CP-1102-BLR',
    type: 'guard_incentive',
    title: 'Guard Incentive: Gate 2 Verification',
    amount: +15.00,
    date: '01 Nov 2026',
    status: 'completed',
    category: 'Guard Reward',
    referenceNumber: 'GRD-CP-1102-BLR',
    note: 'Verified digital pass QR for KA 04 MM 1120 at boom barrier.',
    isDemo: true,
  },
  {
    id: 'tx_05',
    txNumber: 'TOP-CP-5520-UPI',
    type: 'wallet_topup',
    title: 'Simulated UPI Top-up (Google Pay)',
    amount: +500.00,
    date: '30 Oct 2026',
    status: 'completed',
    category: 'Wallet Load',
    paymentMethodUsed: 'UPI / Google Pay',
    referenceNumber: 'TOP-CP-5520-UPI',
    note: 'Simulated top-up for instant booking checkouts.',
    isDemo: true,
  },
  {
    id: 'tx_06',
    txNumber: 'TXN-CP-8830-IND',
    type: 'parking_payment',
    title: 'Nexus Commercial Retailers Spot',
    amount: -140.00,
    date: '29 Oct 2026',
    status: 'completed',
    category: 'Parking Pass',
    relatedBookingId: 'bk_past_02',
    paymentMethodUsed: 'CommunityPark Wallet',
    referenceNumber: 'TXN-CP-8830-IND',
    note: 'Multi-level commercial parking pass payment.',
    isDemo: true,
  },
  {
    id: 'tx_07',
    txNumber: 'PRM-CP-WELCOME',
    type: 'promo_credit',
    title: 'Welcome Community Credit',
    amount: +100.00,
    date: '25 Oct 2026',
    status: 'completed',
    category: 'Promotional',
    referenceNumber: 'PRM-CP-WELCOME',
    note: 'First-time resident joining reward.',
    isDemo: true,
  },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  availableBalance: 1450.00,
  pendingCredits: 0.00,
  earnedAsOwner: 8400.00,
  earnedAsGuard: 750.00,
  transactions: INITIAL_TRANSACTIONS,

  addFunds: (amount: number, method: string = 'Simulated UPI') => {
    const randomRef = `TOP-CP-${Math.floor(1000 + Math.random() * 9000)}-UPI`;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      txNumber: randomRef,
      type: 'wallet_topup',
      title: `Simulated Top-up (${method})`,
      amount: Math.abs(amount),
      date: 'Just now',
      status: 'completed',
      category: 'Wallet Load',
      paymentMethodUsed: method,
      referenceNumber: randomRef,
      note: 'Simulated wallet reload for prototype booking.',
      isDemo: true,
    };

    set((state) => {
      const newBal = state.availableBalance + amount;
      // Sync with user profile wallet
      try {
        useAuthStore.getState().updateProfile({
          wallet: {
            ...useAuthStore.getState().user.wallet,
            balance: newBal,
          },
        });
      } catch {
        // ignore
      }
      return {
        availableBalance: newBal,
        transactions: [newTx, ...state.transactions],
      };
    });
  },

  deductFunds: (amount: number, title: string, bookingId?: string) => {
    const { availableBalance, transactions } = get();
    if (availableBalance < amount) return false;

    const randomRef = `TXN-CP-${Math.floor(1000 + Math.random() * 9000)}-IND`;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      txNumber: randomRef,
      type: 'parking_payment',
      title,
      amount: -Math.abs(amount),
      date: 'Just now',
      status: 'completed',
      category: 'Parking Pass',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'CommunityPark Wallet',
      referenceNumber: randomRef,
      note: 'Debited from simulated wallet balance.',
      isDemo: true,
    };

    const newBal = availableBalance - amount;
    set({
      availableBalance: newBal,
      transactions: [newTx, ...transactions],
    });

    try {
      useAuthStore.getState().updateProfile({
        wallet: {
          ...useAuthStore.getState().user.wallet,
          balance: newBal,
        },
      });
    } catch {
      // ignore
    }

    return true;
  },

  creditRefund: (amount: number, bookingId: string, title: string = 'Parking Refund') => {
    const randomRef = `REF-CP-${Math.floor(1000 + Math.random() * 9000)}-IND`;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      txNumber: randomRef,
      type: 'parking_refund',
      title,
      amount: Math.abs(amount),
      date: 'Just now',
      status: 'completed',
      category: 'Booking Refund',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'Wallet Credit',
      referenceNumber: randomRef,
      note: 'Automated prototype refund on booking cancellation.',
      isDemo: true,
    };

    set((state) => {
      const newBal = state.availableBalance + amount;
      try {
        useAuthStore.getState().updateProfile({
          wallet: {
            ...useAuthStore.getState().user.wallet,
            balance: newBal,
          },
        });
      } catch {
        // ignore
      }
      return {
        availableBalance: newBal,
        transactions: [newTx, ...state.transactions],
      };
    });
  },

  creditOwnerEarning: (amount: number, title: string) => {
    const randomRef = `OWN-CP-${Math.floor(1000 + Math.random() * 9000)}-IND`;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      txNumber: randomRef,
      type: 'owner_earning',
      title,
      amount: Math.abs(amount),
      date: 'Just now',
      status: 'completed',
      category: 'Host Payout',
      referenceNumber: randomRef,
      note: 'Owner earnings from verified completed parking session.',
      isDemo: true,
    };

    set((state) => ({
      earnedAsOwner: state.earnedAsOwner + amount,
      transactions: [newTx, ...state.transactions],
    }));
  },

  creditGuardIncentive: (amount: number, title: string) => {
    const randomRef = `GRD-CP-${Math.floor(1000 + Math.random() * 9000)}-BLR`;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      txNumber: randomRef,
      type: 'guard_incentive',
      title,
      amount: Math.abs(amount),
      date: 'Just now',
      status: 'completed',
      category: 'Guard Reward',
      referenceNumber: randomRef,
      note: 'Gate barrier verification incentive credit.',
      isDemo: true,
    };

    set((state) => ({
      earnedAsGuard: state.earnedAsGuard + amount,
      transactions: [newTx, ...state.transactions],
    }));
  },

  getSummary: () => {
    const { transactions, pendingCredits } = get();
    let totalCredits = 0;
    let totalDebits = 0;

    transactions.forEach((tx) => {
      if (tx.amount > 0) {
        totalCredits += tx.amount;
      } else {
        totalDebits += Math.abs(tx.amount);
      }
    });

    return { totalCredits, totalDebits, pendingCredits };
  },
}));
