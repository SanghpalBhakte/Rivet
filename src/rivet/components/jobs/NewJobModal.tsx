import React, { useState } from 'react';
import { Job } from '../../types/rivet';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (jobs: Job[]) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const { user } = useAuth();
  const actor = { id: user?.id, name: user?.fullName, workspaceId: user?.workspaceId };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceTitle, setServiceTitle] = useState('Airport Express Pickup');
  const [scheduledDateTime, setScheduledDateTime] = useState('Today, 4:30 PM');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [totalAmount, setTotalAmount] = useState('2400');
  const [advancePaid, setAdvancePaid] = useState('1200');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !serviceTitle.trim() || !pickupLocation.trim() || !dropLocation.trim()) {
      setErrorMsg('Please fill in all required fields (*)');
      return;
    }

    const total = parseFloat(totalAmount);
    if (isNaN(total) || total < 0) {
      setErrorMsg('Total amount must be a valid non-negative number');
      return;
    }

    const advance = parseFloat(advancePaid) || 0;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const updatedJobs = await ApiService.createJob(
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          serviceTitle: serviceTitle.trim(),
          scheduledDateTime: scheduledDateTime.trim(),
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
          driverName: driverName.trim() || undefined,
          vehicleDetails: vehicleDetails.trim() || undefined,
          totalAmount: total,
          advancePaid: advance,
        },
        actor.workspaceId,
        actor
      );

      onJobCreated(updatedJobs);
      onClose();
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setPickupLocation('');
      setDropLocation('');
      setDriverName('');
      setVehicleDetails('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create job';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rv-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-job-modal-title">
      <div className="rv-modal-card" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 id="new-job-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--rv-text-primary)' }}>
              Create Work Order / Dispatch Job
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--rv-text-muted)' }}>
              Janai Ops • Register confirmed service dispatch order into Supabase
            </p>
          </div>
          <button className="rv-search-clear" onClick={onClose} title="Close modal">✕</button>
        </div>

        {errorMsg && (
          <div className="rv-error-banner" style={{ marginBottom: '12px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Customer Name *
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Rajesh Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Customer Phone *
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. +91 98220 12345"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
              Service Title / Package *
            </label>
            <input
              type="text"
              className="rv-search-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="e.g. Airport Express Pickup — Ertiga"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Scheduled Time *
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Today, 4:30 PM"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Driver Assigned
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Ramesh K. (Unassigned)"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Pickup Location *
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Nagpur Airport Gate 2"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Drop Location *
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Radisson Blu Civil Lines"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Vehicle Details
              </label>
              <input
                type="text"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="MH-31 EA 4091"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Total Amount (₹) *
              </label>
              <input
                type="number"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="2400"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--rv-text-muted)', marginBottom: '4px' }}>
                Advance Paid (₹)
              </label>
              <input
                type="number"
                className="rv-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="1200"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating Work Order...' : 'Create & Dispatch Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
