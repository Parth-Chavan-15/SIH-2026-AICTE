import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  FileCheck,
  Building,
  Hash
} from 'lucide-react';

export const PortalImportView: React.FC = () => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('GIITS-2026-REPORT');
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<any>(null);

  // Manual file upload state
  const [manualFileName, setManualFileName] = useState<string>('');
  const [manualFileContent, setManualFileContent] = useState<string>('');

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await api.getPortalFixtures();
        setFixtures(res.data?.fixtures || []);
      } catch (err: any) {
        console.error('Failed to load portal fixtures:', err);
      }
    };
    fetchFixtures();
  }, []);

  const handlePreview = async (fixtureId?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setConfirmedResult(null);
    try {
      const payload: any = {};
      if (fixtureId) {
        payload.fixtureId = fixtureId;
      } else if (manualFileContent) {
        payload.fileContent = manualFileContent;
        payload.fileName = manualFileName || 'uploaded-portal-report.json';
      } else {
        payload.fixtureId = selectedFixtureId;
      }

      const res = await api.previewPortalReport(payload);
      setPreviewData(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Report preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setManualFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setManualFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleConfirmIngestion = async () => {
    if (!previewData?.extractedFields) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = {
        applicationId: previewData.extractedFields.applicationId,
        institutionName: previewData.extractedFields.institutionName,
        regionId: previewData.extractedFields.regionId,
        academicYear: previewData.extractedFields.academicYear,
        originalReportContent: JSON.stringify(previewData.originalReport),
        originalReportHash: previewData.immutableHash,
        confirmedDeficiencyItemIds: previewData.extractedDeficiencies?.map((d: any) => d.id) || ['D1', 'D2']
      };
      const res = await api.confirmPortalIngestion(payload);
      setConfirmedResult(res.data);
      setSuccessMsg('Report ingested successfully! Original report preserved immutable and Scoped Re-Scrutiny task created.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ingestion confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 flex items-start gap-3 shadow-sm">
        <FileText className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider text-slate-900">
            Existing AICTE Portal Case/Report Ingestion (Offline Fixture &amp; Document Ingestion)
          </p>
          <p className="mt-1 text-slate-600">
            Per prototype requirements, this is not a live portal connector or web scraper. It ingests previously downloaded AICTE portal Scrutiny/EVC evaluation reports (e.g. GIITS or MCET real-world cases), previews extracted fields with source page mapping, preserves the original file immutable, and generates scoped re-scrutiny tasks under APH §1.8(g).
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Select Demo Fixture or Upload File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Demo Fixtures */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Option A: One-Click Demo Portal Fixtures</h3>
          </div>

          <div className="space-y-3">
            {fixtures.map((fix) => (
              <div
                key={fix.id}
                onClick={() => setSelectedFixtureId(fix.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedFixtureId === fix.id
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{fix.name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {fix.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{fix.description}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Report Type: {fix.reportType} &bull; Case: {fix.applicationId}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handlePreview(selectedFixtureId)}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview &amp; Map Selected Fixture</span>
          </button>
        </div>

        {/* Option 2: Manual Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Option B: Upload Portal Report (JSON / Text)</h3>
          </div>

          <p className="text-xs text-slate-500">
            Upload an exported AICTE portal evaluation report file from your local disk.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs space-y-2">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
            <label className="cursor-pointer text-blue-700 hover:underline font-semibold block">
              <span>Choose file to upload</span>
              <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            {manualFileName && (
              <span className="font-mono text-slate-700 font-semibold block">{manualFileName}</span>
            )}
          </div>

          <button
            onClick={() => handlePreview()}
            disabled={loading || !manualFileContent}
            className="w-full py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Uploaded Report</span>
          </button>
        </div>
      </div>

      {/* Preview & Extraction Matrix */}
      {previewData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Extraction Preview &amp; Field-to-Source Mapping</h3>
              <p className="text-xs text-slate-500">
                Immutable Hash: <code className="text-blue-700 font-bold">{previewData.immutableHash}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Extraction Confidence:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {Math.round(previewData.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Extracted Fields Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Application ID</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {previewData.extractedFields?.applicationId}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Institution Name</span>
              <span className="font-semibold text-slate-800">
                {previewData.extractedFields?.institutionName}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Region / AY</span>
              <span className="font-semibold text-slate-800">
                {previewData.extractedFields?.regionId} ({previewData.extractedFields?.academicYear})
              </span>
            </div>
          </div>

          {/* Extracted Deficiencies */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Extracted Prior Shortcomings / Deficiencies (APH §1.8(g) Scope Candidates)
            </h4>

            <div className="space-y-2">
              {previewData.extractedDeficiencies?.map((def: any) => (
                <div
                  key={def.id}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                        {def.id}
                      </span>
                      <span className="font-semibold text-amber-950">{def.category}</span>
                      <span className="text-[11px] font-mono text-slate-500">[{def.sourceClause}]</span>
                    </div>
                    <p className="text-amber-900 mt-1">{def.description}</p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold self-start sm:self-auto">
                    {def.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Duplicate Warnings or Clean Status */}
          {previewData.duplicateWarning ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Duplicate ID Warning:</strong> This application ID already exists in storage. Proceeding will create a scoped Re-Scrutiny task linked to prior deficiency records without overwriting the original immutable report.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>No duplicate conflicts detected. Report structure validated.</span>
            </div>
          )}

          {/* Confirm & Ingest Action */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleConfirmIngestion}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm &amp; Create Scoped Re-Scrutiny Task</span>
            </button>
          </div>
        </div>
      )}

      {/* Ingestion Confirmation Receipt */}
      {confirmedResult && (
        <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Scoped Re-Scrutiny Task Successfully Spawned</h3>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Scoped Task ID:</span>
              <span className="font-mono font-bold text-emerald-950">{confirmedResult.scopedTaskId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Application Reference:</span>
              <span className="font-mono text-emerald-950">{confirmedResult.applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Scoped Deficiencies Editable:</span>
              <span className="font-mono text-emerald-950">
                {confirmedResult.scopedDeficiencyIds?.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Scope Lock Rule:</span>
              <span className="font-bold text-emerald-900">APH §1.8(g) Strict Lock on Non-Deficient Items</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
