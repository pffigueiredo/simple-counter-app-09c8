
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStubData, setUseStubData] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Stub data for when backend is not available
  const stubCounter: Counter = {
    id: 1,
    value: 0,
    updated_at: new Date()
  };

  const loadCounter = useCallback(async () => {
    try {
      setError(null);
      const result = await trpc.getCounter.query();
      setCounter(result);
      setUseStubData(false);
    } catch (error) {
      console.error('Failed to load counter:', error);
      setError('Backend server is not available. Using local counter instead.');
      setCounter(stubCounter);
      setUseStubData(true);
    } finally {
      setInitialLoadComplete(true);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleOperation = async (operation: 'increment' | 'decrement') => {
    if (!counter) return;
    
    setIsLoading(true);
    try {
      if (useStubData) {
        // Local stub operation when backend is not available
        const newValue = operation === 'increment' 
          ? counter.value + 1 
          : counter.value - 1;
        
        const updatedCounter: Counter = {
          id: 1,
          value: newValue,
          updated_at: new Date()
        };
        setCounter(updatedCounter);
      } else {
        const updatedCounter = await trpc.updateCounter.mutate({ operation });
        setCounter(updatedCounter);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to update counter:', error);
      // Fallback to local operation
      if (!useStubData) {
        setError('Backend server is not available. Switching to local counter.');
        setUseStubData(true);
      }
      
      // Perform local operation regardless
      const newValue = operation === 'increment' 
        ? counter.value + 1 
        : counter.value - 1;
      
      const updatedCounter: Counter = {
        id: 1,
        value: newValue,
        updated_at: new Date()
      };
      setCounter(updatedCounter);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {error && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Counter App</CardTitle>
            <CardDescription>
              A simple counter application
              {useStubData && (
                <span className="block text-orange-600 text-sm mt-1">
                  (Running in local mode)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {counter?.value || 0}
              </div>
              <p className="text-sm text-gray-500">
                Last updated: {counter?.updated_at.toLocaleString() || 'Never'}
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => handleOperation('decrement')}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                - Decrement
              </Button>
              <Button 
                onClick={() => handleOperation('increment')}
                disabled={isLoading}
                size="lg"
                className="flex-1"
              >
                + Increment
              </Button>
            </div>
            
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-1">Updating...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
