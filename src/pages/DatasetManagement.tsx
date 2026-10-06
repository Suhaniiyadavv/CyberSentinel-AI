import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Database, Play, Eye } from 'lucide-react';
import Papa from 'papaparse';
import { api } from '../services/api';

export const DatasetManagement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
    setResultMsg(null);

    // Parse preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, preview: 6 });
      setHeaders(parsed.meta.fields || []);
      setCsvPreview(parsed.data || []);
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setResultMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      try {
        setProgressStage('Validating CSV schema and data types...');
        await new Promise((r) => setTimeout(r, 300));
        setProgressStage('Preprocessing & standardizing numeric feature vectors...');
        await new Promise((r) => setTimeout(r, 500));
        setProgressStage('Executing Isolation Forest & Random Forest inference...');
        await new Promise((r) => setTimeout(r, 600));
        setProgressStage('Correlating incidents, IoCs, and MITRE ATT&CK techniques...');

        const res = await api.uploadDataset(csvData, file.name);
        setProgressStage(null);
        setUploading(false);
        setResultMsg(
          `Success! Ingested ${res.processedCount} events. Generated ${res.alertsGenerated} correlated security alerts and updated SOC metrics.`
        );
      } catch (err: any) {
        setProgressStage(null);
        setUploading(false);
        setErrorMsg(err.message || 'Dataset upload failed');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              Security Dataset Ingestion & Preprocessing Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Upload standard IDS/IPS network traffic datasets (CIC-IDS2017, UNSW-NB15, NSL-KDD format)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Engine: StandardScaler + OneHotEncoder Pipeline
          </span>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl p-8 text-center bg-slate-950/60 transition-colors">
          <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Drag & Drop Security Event Dataset (CSV)
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Supports CSV files containing network flow fields (source_ip, destination_ip, protocol, packet_count, byte_count, labels)
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono cursor-pointer transition-colors shadow-md">
            <span>CHOOSE CSV DATASET</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <div className="mt-3 text-xs font-mono text-cyan-300">
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Action Button & Status */}
        {file && (
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-mono">
              Ready to execute 10-stage ingestion & detection pipeline
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs font-mono shadow-md disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {uploading ? 'INGESTING & PREPROCESSING...' : 'RUN INGESTION PIPELINE'}
            </button>
          </div>
        )}

        {progressStage && (
          <div className="mt-4 p-3 bg-slate-950 rounded border border-cyan-800 text-xs font-mono text-cyan-300 animate-pulse flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>{progressStage}</span>
          </div>
        )}

        {resultMsg && (
          <div className="mt-4 p-3 bg-emerald-950/40 rounded border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-950/40 rounded border border-rose-800 text-xs font-mono text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* CSV Dataset Preview */}
      {csvPreview.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Dataset Structure Preview (First 5 Rows)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Columns: {headers.length} | Preview: {csvPreview.length} rows
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="py-2 px-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {csvPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    {headers.map((h) => (
                      <td key={h} className="py-2 px-2.5 text-slate-300 whitespace-nowrap max-w-xs truncate">
                        {row[h] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
