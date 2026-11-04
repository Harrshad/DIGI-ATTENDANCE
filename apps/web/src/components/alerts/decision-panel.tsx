'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { escalateExceptionSchema, resolveExceptionSchema } from '@triattendance/shared';

interface DecisionPanelProps {
  exceptionId: string;
  employeeName: string;
  canApproveOrReject?: boolean;
  onDecisionSubmitted?: (action: 'ESCALATE' | 'APPROVE' | 'REJECT', note: string) => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  exceptionId: _exceptionId,
  employeeName,
  canApproveOrReject = true, // By default enabled with special permissions as resolved in SPEC
  onDecisionSubmitted,
}) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEscalate = async () => {
    setError(null);
    const parseResult = escalateExceptionSchema.safeParse({ note });
    if (!parseResult.success) {
      setError(parseResult.error.issues[0]?.message || 'A note is required for escalation');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      setSuccess(`Exception for ${employeeName} has been escalated to supervisor.`);
      onDecisionSubmitted?.('ESCALATE', note);
    } catch {
      setError('Failed to escalate exception. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    const parseResult = resolveExceptionSchema.safeParse({ decision, note });
    if (!parseResult.success) {
      setError(
        parseResult.error.issues[0]?.message ||
          (decision === 'REJECT' ? 'A note is required when rejecting' : 'Invalid submission')
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      const actionText = decision === 'APPROVE' ? 'approved' : 'rejected';
      setSuccess(`Exception for ${employeeName} has been marked as ${actionText}.`);
      onDecisionSubmitted?.(decision, note);
    } catch {
      setError(`Failed to ${decision.toLowerCase()} exception. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-600" />
          Your Decision
        </h2>
        <span className="text-xs text-gray-400">AM Review Portal</span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Approving marks {employeeName} as present at the recorded time; rejecting marks them absent
        for the day. You can also escalate the case to the reporting supervisor.
      </p>

      {/* Note textarea */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Reviewer Note <span className="text-gray-400 font-normal lowercase">(required for rejection and escalation)</span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Add review note (e.g. Client visit at Guindy confirmed with manager, or off-site assignment approved)..."
          className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
            error ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
          }`}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Decision Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 border-t border-gray-100">
        {canApproveOrReject && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || !!success}
              onClick={() => handleResolve('REJECT')}
              className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 gap-1.5 font-semibold text-xs"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Reject Check-in</span>
            </Button>

            <Button
              type="button"
              disabled={isSubmitting || !!success}
              onClick={() => handleResolve('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Approve Check-in</span>
            </Button>
          </>
        )}

        <Button
          type="button"
          disabled={isSubmitting || !!success}
          onClick={handleEscalate}
          className="gap-1.5 font-semibold text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Escalate to Supervisor</span>
        </Button>
      </div>

      {/* DERIVED Footnote */}
      <p className="text-[11px] text-gray-400 italic pt-1 border-t border-gray-50">
        * DERIVED — By default, Account Managers have escalation rights. Account Managers holding
        delegated special permissions unlock direct Accept/Reject decisions. Note is strictly required
        when rejecting.
      </p>
    </div>
  );
};
