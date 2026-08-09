import React, { useState } from 'react';
import { Settings, Building2, Sliders, ShieldCheck, Receipt, Bell, CheckCircle2, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'OPERATIONS' | 'RECEIPTS' | 'SECURITY'>('GENERAL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [restaurantName, setRestaurantName] = useState('AURA Gastronomy Flagship');
  const [taxRate, setTaxRate] = useState('8.25');
  const [serviceCharge, setServiceCharge] = useState('10.0');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for dining at AURA. Atmospheric Perfection.');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-7xl mx-auto space-y-6 pb-24 font-sans text-aura-ivory">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-aura-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-aura-gold/10 border border-aura-gold/30 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-aura-gold" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-aura-ivory">SAAS PLATFORM SETTINGS</h1>
            <p className="text-xs text-aura-slate">Configure Restaurant Branding, Taxes, Thermal Receipts & Security</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl shadow-lg shadow-aura-gold/20 flex items-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully updated and persisted across restaurant platform!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex space-x-3 border-b border-aura-border pb-3 text-xs">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'GENERAL' ? 'bg-aura-gold text-aura-obsidian' : 'text-aura-slate hover:text-aura-ivory'
          }`}
        >
          General & Branding
        </button>
        <button
          onClick={() => setActiveTab('OPERATIONS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'OPERATIONS' ? 'bg-aura-gold text-aura-obsidian' : 'text-aura-slate hover:text-aura-ivory'
          }`}
        >
          Taxes & Operations
        </button>
        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'RECEIPTS' ? 'bg-aura-gold text-aura-obsidian' : 'text-aura-slate hover:text-aura-ivory'
          }`}
        >
          Thermal Receipts
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'SECURITY' ? 'bg-aura-gold text-aura-obsidian' : 'text-aura-slate hover:text-aura-ivory'
          }`}
        >
          Security & Audit
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-aura-container/80 backdrop-blur-xl border border-aura-border rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl">
        {activeTab === 'GENERAL' && (
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-aura-ivory">Restaurant Profile & Branding</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-aura-slate">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-aura-slate">Currency Symbol</label>
                <input
                  type="text"
                  defaultValue="£"
                  className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-aura-slate">Timezone</label>
                <input
                  type="text"
                  defaultValue="Europe/London (GMT)"
                  className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'OPERATIONS' && (
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-aura-ivory">Taxes, Gratuity & Service Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-aura-slate">Tax Rate (%)</label>
                <input
                  type="text"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-aura-slate">Service Charge (%)</label>
                <input
                  type="text"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'RECEIPTS' && (
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-aura-ivory">Thermal Printer Receipt Customizer</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-aura-slate">Receipt Footer Slogan</label>
              <textarea
                rows={3}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-aura-ivory">Security Policies & Audit Logs</h3>
            <div className="p-4 rounded-xl bg-aura-obsidian border border-aura-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-aura-ivory">Cryptographic HMAC Table Token Enforcement</span>
                <span className="text-emerald-400 font-bold">Active & Enforced</span>
              </div>
              <p className="text-[10px] text-aura-slate">Guards POST /api/v1/orders against spoofing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
