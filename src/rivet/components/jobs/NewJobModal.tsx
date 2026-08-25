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
    <div className="rv-modal-overlay" onClick={onClose}>
      <div
        className="rv-modal"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Create Dispatch Job"
      >
        <div className="rv-modal__header">
          <div>
            <span className="rv-kicker">Dispatch Manifest</span>
            <h3 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              Create Work Order
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rv-modal__body">
            {errorMsg && (
              <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', color: 'var(--rv-status-overdue-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Customer Name *</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Rajesh Sharma"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  className="rv-input"
                  placeholder="+91 98220 12345"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="rv-form-group">
              <label className="rv-label">Service Description *</label>
              <input
                type="text"
                className="rv-input"
                placeholder="Airport Express Pickup (Ertiga / Innova)"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
              />
            </div>

            <div className="rv-form-group">
              <label className="rv-label">Scheduled Date & Time *</label>
              <input
                type="text"
                className="rv-input"
                placeholder="Today, 4:30 PM"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Pickup Location *</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Airport Terminal Gate 2"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Drop Destination *</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Hotel Radisson Blu"
                  required
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Assigned Driver</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Ramesh K."
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Vehicle Details</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Swift Dzire MH-31 EA 4091"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Total Amount (₹) *</label>
                <input
                  type="number"
                  className="rv-input"
                  placeholder="2400"
                  required
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Advance Paid (₹)</label>
                <input
                  type="number"
                  className="rv-input"
                  placeholder="1200"
                  min="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rv-modal__footer">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? 'Creating Work Order...' : '+ Schedule Dispatch Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
