/**
 * Pricing summary panel.
 * 
 * Displays itemized pricing breakdown and total cost.
 */

import { useConfiguratorStore } from '../store/configurator';
import { formatPrice } from '@cart-configurator/pricing';

export function PricingSummary() {
  const pricing = useConfiguratorStore(state => state.pricing);

  if (!pricing) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Pricing</h2>
        <p>Loading pricing information...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      <h2>Pricing Summary</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Base Platform</h3>
        <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
          {formatPrice(pricing.basePlatformPrice)}
        </div>
      </div>

      {pricing.optionLineItems.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Options</h3>
          {pricing.optionLineItems.map(item => (
            <div
              key={item.optionId}
              style={{
                padding: '8px',
                margin: '4px 0',
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{item.optionName}</strong>
                <span>{formatPrice(item.totalCost)}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Parts: {formatPrice(item.partsCost)} | Labor: {formatPrice(item.laborCost)}
              </div>
            </div>
          ))}
        </div>
      )}

      {pricing.materialLineItems.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Materials</h3>
          {pricing.materialLineItems.map(item => (
            <div
              key={`${item.zone}-${item.materialId}`}
              style={{
                padding: '8px',
                margin: '4px 0',
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>
                {item.zone}: {item.materialName}
              </span>
              <span>{formatPrice(item.cost)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '2px solid #333', paddingTop: '16px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Subtotal (Parts + Materials):</span>
          <strong>{formatPrice(pricing.subtotal)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Labor:</span>
          <strong>{formatPrice(pricing.laborTotal)}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '20px',
            marginTop: '12px',
            padding: '12px',
            background: '#0066cc',
            color: 'white',
            borderRadius: '4px'
          }}
        >
          <span>Grand Total:</span>
          <strong>{formatPrice(pricing.grandTotal)}</strong>
        </div>
      </div>
    </div>
  );
}
