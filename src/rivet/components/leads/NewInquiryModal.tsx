import React, { useState } from 'react';
import { Lead } from '../../types/rivet';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (newLead: Lead) => void;
}

export const NewInquiryModal: React.FC<NewInquiryModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTitle, setServiceTitle] = useState('Outstation Cab Rental');
  const [travelDate, setTravelDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'WhatsApp' | 'Website'>('WhatsApp');

  if (!isOpen) return null;

  // Parser for structured WhatsApp messages
  const handleParseWhatsApp = () => {
    if (!pasteText.trim()) return;

    let parsedName = name;
    let parsedPhone = phone;
    let parsedService = serviceTitle;
    let parsedDate = travelDate;
    let parsedPickup = pickupLocation;
    let parsedNotes = notes;

    const lines = pasteText.split('\n');
    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith('name:')) {
        parsedName = line.substring(5).trim();
      } else if (lower.startsWith('phone:') || lower.startsWith('mobile:')) {
        parsedPhone = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('service needed:') || lower.startsWith('service:')) {
        parsedService = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('travel date:') || lower.startsWith('date:')) {
        parsedDate = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('pickup location:') || lower.startsWith('pickup:')) {
        parsedPickup = line.substring(line.indexOf(':') + 1).trim();
      } else if (lower.startsWith('notes:')) {
        parsedNotes = line.substring(6).trim();
      }
    });

    setName(parsedName);
    setPhone(parsedPhone);
    if (parsedService) setServiceTitle(parsedService);
    if (parsedDate) setTravelDate(parsedDate);
    if (parsedPickup) setPickupLocation(parsedPickup);
    if (parsedNotes) setNotes(parsedNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newLead: Lead = {
      id: `ld-${Date.now()}`,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@inquiry.com`,
      serviceTitle: serviceTitle.trim(),
      source: source,
      stage: 'New',
      budget: 'To Quote',
      quoteAmount: 'To Quote',
      quoteStatus: 'Not Sent',
      nextFollowUp: 'Today, 6:00 PM',
      assignee: 'Janai Desk',
      createdAt: new Date().toISOString().split('T')[0],
      primaryActionLabel: 'Mark Contacted',
      notes: [
        {
          id: `n-${Date.now()}`,
          author: 'System',
          timestamp: 'Just now',
          text: `Inquiry captured from ${source}. Pickup: ${pickupLocation || 'Central Terminal'}. Travel Date: ${travelDate || 'Flexible'}. ${notes ? `Notes: ${notes}` : ''}`,
        },
      ],
    };

    ApiService.createTask({
      title: `Send quote for ${newLead.serviceTitle}`,
      type: 'Quote Follow-up',
      priority: 'High',
      dueDateTime: newLead.nextFollowUp || 'Today, 6:00 PM',
      assignee: newLead.assignee || 'Janai Desk',
      linkedEntityType: 'Lead',
      linkedEntityName: `${newLead.customerName} (${newLead.serviceTitle})`,
      notes: `Auto-generated from ${source} Intake. Contact: ${newLead.customerPhone}`,
    }).catch(console.error);

    onAddLead(newLead);
    onClose();
    setName('');
    setPhone('');
    setTravelDate('');
    setPickupLocation('');
    setNotes('');
    setPasteText('');
  };

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div
        className="rv-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="New Lead Inquiry Intake"
      >
        {/* Header */}
        <div className="rv-modal__header">
          <div>
            <span className="rv-kicker">New Intake Bridge</span>
            <h3 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: 'var(--rv-text-primary)' }}>
              Capture Customer Inquiry
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="rv-modal__body">
          {/* Smart WhatsApp Paste Box */}
          <div style={{ background: 'var(--rv-bg-input)', padding: '12px', borderRadius: 'var(--rv-radius-md)', border: '1px solid var(--rv-border-subtle)', marginBottom: '16px' }}>
            <div className="rv-label" style={{ marginBottom: '6px' }}>Smart WhatsApp Message Parser</div>
            <textarea
              className="rv-textarea"
              rows={3}
              placeholder="Paste raw WhatsApp inquiry text here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleParseWhatsApp}
              style={{ marginTop: '8px', width: '100%' }}
            >
              ⚡ Auto-Parse Inquiry Text
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Customer Name *</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Rajesh Sharma"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Mobile / Phone *</label>
                <input
                  type="tel"
                  className="rv-input"
                  placeholder="+91 98230 11452"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="rv-form-group" style={{ margin: 0 }}>
              <label className="rv-label">Service Request</label>
              <input
                type="text"
                className="rv-input"
                placeholder="Outstation Cab / Airport Express / Tour Package"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Travel Date</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="2026-08-26 / Flexible"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                />
              </div>

              <div className="rv-form-group" style={{ margin: 0 }}>
                <label className="rv-label">Pickup Location</label>
                <input
                  type="text"
                  className="rv-input"
                  placeholder="Airport Gate 2"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="rv-form-group" style={{ margin: 0 }}>
              <label className="rv-label">Inquiry Source</label>
              <select
                className="rv-select"
                value={source}
                onChange={(e) => setSource(e.target.value as 'WhatsApp' | 'Website')}
              >
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Website">Website Intake Form</option>
              </select>
            </div>

            <div className="rv-form-group" style={{ margin: 0 }}>
              <label className="rv-label">Notes & Details</label>
              <textarea
                className="rv-textarea"
                rows={2}
                placeholder="Special requirements, luggage count, vehicle preference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                + Create Lead
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
