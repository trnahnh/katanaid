import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types matching your backend response
interface EmailCheckResult {
  email: string;
  risk_score: number;
  flags: string[];
  suggestion: "allow" | "review" | "block";
}

// Human-readable flag labels
const FLAG_LABELS: Record<string, string> = {
  invalid_format: "Invalid Format",
  disposable: "Disposable Email",
  no_mx_record: "No Mail Server",
  plus_addressing: "Plus Addressing",
  random_pattern: "Random Characters",
  numeric_heavy: "Too Many Numbers",
};

const getFlagLabel = (flag: string): string => {
  // Handle typosquat flags like "typosquat:gmail.com"
  if (flag.startsWith("typosquat:")) {
    const correctDomain = flag.split(":")[1];
    return `Typo (did you mean ${correctDomain}?)`;
  }
  return FLAG_LABELS[flag] || flag;
};

interface BulkSummary {
  total: number;
  safe: number;
  suspicious: number;
  risky: number;
}

interface BulkCheckResponse {
  results: EmailCheckResult[];
  summary: BulkSummary;
}

const EmailFraudPage = () => {
  // Single check state
  const [email, setEmail] = useState("");
  const [singleResult, setSingleResult] = useState<EmailCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Bulk check state
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkResults, setBulkResults] = useState<BulkCheckResponse | null>(null);
  const [isBulkChecking, setIsBulkChecking] = useState(false);

  // Single email check handler
  const handleSingleCheck = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    setIsChecking(true);
    setSingleResult(null);

    try {
      const response = await axiosInstance.post("/api/spam/email-check", {
        email: email.trim(),
      });
      setSingleResult(response.data);
    } catch (error) {
      toast.error("Failed to check email");
    } finally {
      setIsChecking(false);
    }
  };

  // Bulk email check handler
  const handleBulkCheck = async () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    if (emails.length > 100) {
      toast.error("Maximum 100 emails allowed");
      return;
    }

    setIsBulkChecking(true);
    setBulkResults(null);

    try {
      const response = await axiosInstance.post("/api/spam/email-bulk", {
        emails,
      });
      setBulkResults(response.data);
    } catch (error) {
      toast.error("Failed to check emails");
    } finally {
      setIsBulkChecking(false);
    }
  };

  // Badge color based on suggestion
  const getSuggestionBadge = (suggestion: string) => {
    switch (suggestion) {
      case "allow":
        return <Badge className="bg-green-500 hover:bg-green-600">Allow</Badge>;
      case "review":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Review</Badge>;
      case "block":
        return <Badge className="bg-red-500 hover:bg-red-600">Block</Badge>;
      default:
        return <Badge>{suggestion}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Single Email Check Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Fraud Check</CardTitle>
          <CardDescription>
            Check if an email address is from a disposable provider or shows spam patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSingleCheck()}
              className="flex-1"
            />
            <Button onClick={handleSingleCheck} disabled={isChecking}>
              {isChecking ? "Checking..." : "Check Email"}
            </Button>
          </div>

          {/* Single Result Display */}
          {singleResult && (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{singleResult.email}</span>
                {getSuggestionBadge(singleResult.suggestion)}
              </div>
              <div className="text-sm text-muted-foreground">
                Risk Score: {(singleResult.risk_score * 100).toFixed(0)}%
              </div>
              {singleResult.flags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {singleResult.flags.map((flag, i) => (
                    <Badge key={i} variant="outline">{getFlagLabel(flag)}</Badge>
                  ))}
                </div>
              )}
              {singleResult.flags.length === 0 && (
                <div className="text-sm text-green-500">No issues detected</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Email Check Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Email Check</CardTitle>
          <CardDescription>
            Check multiple emails at once (one per line, max 100).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border rounded-md bg-background resize-none font-mono text-sm"
            placeholder={"email1@example.com\nemail2@tempmail.com\nemail3@gmail.com"}
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
          />
          <Button onClick={handleBulkCheck} disabled={isBulkChecking}>
            {isBulkChecking ? "Checking..." : "Check All Emails"}
          </Button>

          {/* Bulk Results */}
          {bulkResults && (
            <div className="space-y-4 pt-4 border-t">
              {/* Summary */}
              <div className="flex gap-4 text-sm">
                <span>Total: {bulkResults.summary.total}</span>
                <span className="text-green-500">Safe: {bulkResults.summary.safe}</span>
                <span className="text-yellow-500">Suspicious: {bulkResults.summary.suspicious}</span>
                <span className="text-red-500">Risky: {bulkResults.summary.risky}</span>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Risk</th>
                      <th className="text-left p-3">Flags</th>
                      <th className="text-left p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.results.map((result, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 font-mono">{result.email}</td>
                        <td className="p-3">{(result.risk_score * 100).toFixed(0)}%</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {result.flags.length > 0 ? (
                              result.flags.map((flag, j) => (
                                <Badge key={j} variant="outline" className="text-xs">{getFlagLabel(flag)}</Badge>
                              ))
                            ) : (
                              <span className="text-green-500 text-xs">Clean</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{getSuggestionBadge(result.suggestion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailFraudPage;