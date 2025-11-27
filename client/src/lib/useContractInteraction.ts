import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ContractConfig {
  address: string;
  chainId: number;
}

interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function useContractInteraction(config: ContractConfig) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getWeb3Provider = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    return window.ethereum;
  }, []);

  const registerMiner = useCallback(async (stakeAmount: string): Promise<TransactionResult> => {
    setLoading(true);
    try {
      const provider = await getWeb3Provider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (!accounts?.length) throw new Error('No connected account');

      const weiAmount = BigInt(stakeAmount) * BigInt(10 ** 18);
      
      const transactionParameters = {
        from: accounts[0],
        to: config.address,
        value: '0x' + weiAmount.toString(16),
        data: '0x...',
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      toast({
        title: 'Registration Pending',
        description: 'Your miner registration is being processed',
      });

      return {
        hash: txHash,
        status: 'pending',
        message: 'Transaction submitted',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return {
        hash: '',
        status: 'error',
        message,
      };
    } finally {
      setLoading(false);
    }
  }, [config.address, getWeb3Provider, toast]);

  const claimRewards = useCallback(async (): Promise<TransactionResult> => {
    setLoading(true);
    try {
      const provider = await getWeb3Provider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (!accounts?.length) throw new Error('No connected account');

      const transactionParameters = {
        from: accounts[0],
        to: config.address,
        data: '0x...',
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      toast({
        title: 'Claim Pending',
        description: 'Your reward claim is being processed',
      });

      return {
        hash: txHash,
        status: 'pending',
        message: 'Claim submitted',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Claim failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return {
        hash: '',
        status: 'error',
        message,
      };
    } finally {
      setLoading(false);
    }
  }, [config.address, getWeb3Provider, toast]);

  const unstake = useCallback(async (amount: string): Promise<TransactionResult> => {
    setLoading(true);
    try {
      const provider = await getWeb3Provider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (!accounts?.length) throw new Error('No connected account');

      const weiAmount = BigInt(amount) * BigInt(10 ** 18);

      const transactionParameters = {
        from: accounts[0],
        to: config.address,
        data: '0x...',
        value: '0x' + weiAmount.toString(16),
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      toast({
        title: 'Unstake Pending',
        description: 'Your unstake request is being processed',
      });

      return {
        hash: txHash,
        status: 'pending',
        message: 'Unstake submitted',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unstake failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return {
        hash: '',
        status: 'error',
        message,
      };
    } finally {
      setLoading(false);
    }
  }, [config.address, getWeb3Provider, toast]);

  return {
    loading,
    registerMiner,
    claimRewards,
    unstake,
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
