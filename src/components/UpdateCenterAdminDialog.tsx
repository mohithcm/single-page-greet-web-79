import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Building2 } from "lucide-react";

interface UpdateCenterAdminDialogProps {
  open: boolean;
  onClose: () => void;
  center: {
    _id: string;
    name: string;
    adminId?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  onUpdateComplete: () => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  diagnosticCenterId?: string;
}

const UpdateCenterAdminDialog = ({ open, onClose, center, onUpdateComplete }: UpdateCenterAdminDialogProps) => {
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [centerAdmins, setCenterAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCenterAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users?role=diagnostic_center_admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCenterAdmins(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching center admins:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCenterAdmins();
      setSelectedAdminId(center.adminId?._id || "");
    }
  }, [open, center.adminId]);

  const handleUpdate = async () => {
    if (!selectedAdminId) {
      toast({
        title: "Missing Information",
        description: "Please select an admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/update-center-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          centerId: center._id,
          adminId: selectedAdminId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Admin assignment updated successfully",
        });
        onClose();
        onUpdateComplete();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update admin assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update admin assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAdmin = centerAdmins.find(a => a._id === selectedAdminId);
  const availableAdmins = centerAdmins.filter(admin => 
    !admin.diagnosticCenterId || admin._id === center.adminId?._id
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Update Admin for {center.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Current Assignment */}
          {center.adminId && (
            <Card className="border-muted bg-muted/30">
              <CardContent className="pt-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Current Assignment:</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{center.adminId.name} ({center.adminId.email})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Selection */}
          <div className="space-y-2">
            <Label htmlFor="admin">Select New Administrator</Label>
            <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an admin" />
              </SelectTrigger>
              <SelectContent>
                {availableAdmins.map((admin) => (
                  <SelectItem key={admin._id} value={admin._id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-xs text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableAdmins.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available center admins found
              </p>
            )}
          </div>

          {/* Update Preview */}
          {selectedAdmin && selectedAdminId !== center.adminId?._id && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Update Preview:</p>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Center:</span> {center.name}</p>
                    <p><span className="text-muted-foreground">New Admin:</span> {selectedAdmin.name} ({selectedAdmin.email})</p>
                    {center.adminId && (
                      <p className="text-amber-600">
                        <span className="text-muted-foreground">Replacing:</span> {center.adminId.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!selectedAdminId || selectedAdminId === center.adminId?._id || loading}
            >
              {loading ? "Updating..." : "Update Assignment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCenterAdminDialog;