import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigRule } from '../../types';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Edit2,
  Save,
  X,
  FileCheck,
} from 'lucide-react';

export const ConfigRulesView: React.FC = () => {
  const { role, user, configRules, updateConfigRule } = useApp();

  const [editingRule, setEditingRule] = useState<ConfigRule | null>(null);
  const [newValueInput, setNewValueInput] = useState<string | number>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = (rule: ConfigRule) => {
    setEditingRule(rule);
    setNewValueInput(rule.currentValue);
  };

  const handleOpenConfirm = () => {
    if (!editingRule || newValueInput === editingRule.currentValue) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    if (!editingRule) return;
    setIsUpdating(true);
    try {
      await updateConfigRule(editingRule.id, newValueInput);
      setShowConfirmModal(false);
      setEditingRule(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const categories = Array.from(new Set(configRules.map((r) => r.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Regulatory Rules & Workflow SLA Configuration
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Admin & Bureau Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure statutory processing windows, automated escalation thresholds, and approval route parameters
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const rules = configRules.filter((r) => r.category === category);

          return (
            <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{category}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {rules.length} Configurable Parameters
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900">{rule.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-500">
                          {rule.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Last Modified: {rule.lastUpdated} by {rule.updatedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 block font-mono">
                          {rule.currentValue}{' '}
                          <span className="text-xs font-normal text-slate-500">{rule.unit}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {rule.status}
                        </span>
                      </div>

                      {(role === 'admin' || role === 'bureau_officer') && (
                        <button
                          onClick={() => handleStartEdit(rule)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          title="Edit rule threshold"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Configure Rule Threshold</h3>
              <button onClick={() => setEditingRule(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{editingRule.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{editingRule.description}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Threshold Value ({editingRule.unit})
                </label>
                <input
                  type="number"
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-base font-bold font-mono text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-[11px] border border-amber-200">
                <strong>Attention:</strong> Changing this parameter modifies the live SLA calculation engine for all active applications across AICTE regional offices.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingRule(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Preview Change & Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Before Overwrite */}
      {showConfirmModal && editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Confirm SLA Parameter Update
                  </h4>
                  <p className="text-slate-500 text-xs">Publication requires authorization confirmation</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rule:</span>
                  <span className="font-bold text-slate-800">{editingRule.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Value:</span>
                  <span className="font-bold text-slate-700">{editingRule.currentValue} {editingRule.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Value:</span>
                  <span className="font-bold text-blue-700">{newValueInput} {editingRule.unit}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-[11px]">
                  <span className="text-slate-500">Authorized Officer:</span>
                  <span className="font-medium text-slate-700">{user.name} ({user.roleTitle})</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">
                Are you sure you wish to publish this change to the regulatory workflow engine? An audit entry will be generated.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                {isUpdating ? 'Saving...' : 'Authorize & Publish Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
