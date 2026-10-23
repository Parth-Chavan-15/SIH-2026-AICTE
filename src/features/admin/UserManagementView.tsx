import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';
import { UserRole } from '../../types';
import {
  Users2,
  Shield,
  Building2,
  Award,
  CheckCircle2,
  Lock,
  UserCheck,
  Search,
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { role, setRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const usersList = Object.values(MOCK_USERS);

  const permissionsMatrix = [
    { module: 'Submit Application & Resubmit Deficiencies', inst: true, ro: false, bo: false, evc: false, adm: true },
    { module: 'Regional Document Scrutiny & Observations', inst: false, ro: true, bo: true, evc: false, adm: true },
    { module: 'EVC Panel Scheduling & Member Constitution', inst: false, ro: true, bo: true, evc: false, adm: true },
    { module: 'Physical/Virtual EVC Inspection Report Scoring', inst: false, ro: false, bo: false, evc: true, adm: true },
    { module: 'Standing Appellate Committee (SAC) Review', inst: false, ro: false, bo: true, evc: false, adm: true },
    { module: 'Executive Committee Approval Order Issuance', inst: false, ro: false, bo: true, evc: false, adm: true },
    { module: 'Configure SLA Timelines & Escalation Rules', inst: false, ro: false, bo: true, evc: false, adm: true },
    { module: 'WORM Immutable Audit Trail Access', inst: false, ro: true, bo: true, evc: true, adm: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            User Management & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional users, Regional Officers, Bureau Directors, and Inspection Committee Panels
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Provisioned System Users ({usersList.length})</h3>
          <span className="text-xs text-slate-500 font-medium">Click to assume identity for testing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Organization / Office</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Switch Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => {
                const isCurrent = role === u.role;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {u.roleTitle}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.organization}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {u.region}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active Official
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setRole(u.role)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white cursor-default shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Current Persona' : 'Simulate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">
            Regulatory Security & Authority Permissions Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict role-based isolation enforced across the AICTE approval lifecycle
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">System Capability / Operational Task</th>
                <th className="py-3 px-3 text-center">Institution</th>
                <th className="py-3 px-3 text-center">Regional Officer</th>
                <th className="py-3 px-3 text-center">Bureau Officer</th>
                <th className="py-3 px-3 text-center">EVC Panel</th>
                <th className="py-3 px-3 text-center">Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.module}</td>
                  <td className="py-3 px-3 text-center">
                    {item.inst ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.ro ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.bo ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.evc ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.adm ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
