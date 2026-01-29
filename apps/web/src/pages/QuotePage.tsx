/**
 * Quote submission page.
 * 
 * Collects customer information and submits a quote request.
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfiguratorStore } from '../store/configurator';
import { PricingSummary } from '../components/PricingSummary';
import { submitQuote } from '../api/client';
import { QuoteRequest } from '@cart-configurator/types';

export function QuotePage() {
  const navigate = useNavigate();
  const configuration = useConfiguratorStore(state => state.configuration);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!configuration) return;

    setIsSubmitting(true);
    try {
      const quoteRequest: QuoteRequest = {
        configurationId: configuration.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        message: formData.message,
        submittedAt: new Date()
      };

      await submitQuote(quoteRequest);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
        <h1>Quote Request Submitted!</h1>
        <p style={{ fontSize: '18px', margin: '20px 0' }}>
          Thank you for your interest. We'll review your configuration and get back to you shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Start New Configuration
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side - Form */}
      <div style={{ flex: 1, padding: '40px', background: 'white' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Configurator
        </button>

        <h1>Request a Quote</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Fill out the form below and we'll get back to you with a detailed quote.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Additional Notes
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '18px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>

      {/* Right side - Pricing summary */}
      <div style={{ width: '400px', borderLeft: '1px solid #ccc', background: '#f9f9f9' }}>
        <PricingSummary />
      </div>
    </div>
  );
}
