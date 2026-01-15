import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  
  const [firstName, setFirstName] = useState(authUser?.firstName || "");
  const [lastName, setLastName] = useState(authUser?.lastName || "");

  // Sync with store if authUser changes
  useEffect(() => {
    setFirstName(authUser?.firstName || "");
    setLastName(authUser?.lastName || "");
  }, [authUser?.firstName, authUser?.lastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  const hasChanges = 
    firstName.trim() !== (authUser?.firstName || "") || 
    lastName.trim() !== (authUser?.lastName || "");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your name to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isUpdatingProfile || !hasChanges}>
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
              {!hasChanges && (
                <span className="text-sm text-muted-foreground">No changes to save</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}