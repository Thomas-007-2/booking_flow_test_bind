import React, { useState, useEffect } from 'react';
    import { testSupabaseConnection } from '../lib/testSupabaseConnection';

    export default function ConnectionTest() {
      const [connectionStatus, setConnectionStatus] = useState('testing');
      const [details, setDetails] = useState(null);

      useEffect(() => {
        const testConnection = async () => {
          const result = await testSupabaseConnection();
          setConnectionStatus(result.success ? 'success' : 'failed');
          setDetails(result);
        };

        testConnection();
      }, []);

      return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
          
          {connectionStatus === 'testing' && (
            <div className="text-blue-600">Testing connection...</div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="text-green-600">
              <div className="font-semibold">Connection Successful!</div>
              <div className="text-sm mt-2">
                Found {details?.data?.length || 0} merchants in the database.
              </div>
            </div>
          )}
          
          {connectionStatus === 'failed' && (
            <div className="text-red-600">
              <div className="font-semibold">Connection Failed</div>
              <div className="text-sm mt-2">
                Error: {details?.error?.message || 'Unknown error'}
              </div>
            </div>
          )}
        </div>
      );
    }