"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download, Copy, FileText } from "lucide-react";
import CustomModal from "@/components/ui/customModal";
import { toast } from "sonner";

export default function PayrollDescriptionModal({
  isOpen,
  onClose,
  payrollId,
  payrollData
}) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (isOpen && payrollId) {
      fetchDescription();
    }
  }, [isOpen, payrollId]);

  const fetchDescription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payroll/${payrollId}/description`);
      const data = await response.json();
      
      if (data.success) {
        setDescription(data.data.description);
      } else {
        toast.error("Failed to load description");
      }
    } catch (error) {
      console.error("Error fetching description:", error);
      toast.error("Error loading description");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/payroll/${payrollId}/description`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setDescription(data.data.description);
        toast.success("Description regenerated");
      } else {
        toast.error("Failed to regenerate description");
      }
    } catch (error) {
      console.error("Error regenerating description:", error);
      toast.error("Error regenerating description");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([description], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-slip-${payrollData?.agent?.agentName || 'agent'}-${payrollData?.month}-${payrollData?.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded as text file");
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salary Details - ${payrollData?.agent?.agentName || ''}`}
      description={`${payrollData?.month}/${payrollData?.year}`}
      size="4xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Description Content */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {description}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-2"
                >
                  {regenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerate
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
}
