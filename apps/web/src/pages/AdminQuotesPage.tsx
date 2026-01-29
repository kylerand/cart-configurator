/**
 * Admin page for viewing quote requests.
 * 
 * Lists all submitted quotes with configuration details.
 */

import { useState, useEffect } from 'react';
import { fetchQuotes } from '../api/client';

interface QuoteRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  status: string;
  submittedAt: string;
  configuration: {
    id: string;
    platformId: string;
    selectedOptions: string;
  };
}

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await fetchQuotes();
      setQuotes(data as QuoteRecord[]);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Loading quotes...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Quote Requests</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {quotes.length} total requests
      </p>

      {quotes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
          <p>No quote requests yet.</p>
        </div>
      ) : (
        <div>
          {quotes.map(quote => (
            <div
              key={quote.id}
              style={{
                padding: '20px',
                margin: '16px 0',
                border: '1px solid #ccc',
                borderRadius: '8px',
                background: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>{quote.customerName}</h3>
                <span
                  style={{
                    padding: '4px 12px',
                    background: quote.status === 'PENDING' ? '#ffcc00' : '#cccccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {quote.status}
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email:</strong> {quote.customerEmail}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Phone:</strong> {quote.customerPhone}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Submitted:</strong> {new Date(quote.submittedAt).toLocaleString()}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Configuration ID:</strong> {quote.configuration.id}
                </p>
              </div>

              {quote.message && (
                <div
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    marginTop: '12px'
                  }}
                >
                  <strong>Notes:</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{quote.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
