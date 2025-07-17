import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Building2, User } from "lucide-react";

interface CenterAdminAssignmentDialogProps {
  onAssignmentComplete: () => void;
}

interface DiagnosticCenter {
  _id: string;
  name: string;
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  diagnosticCenterId?: string;
}

const CenterAdminAssignmentDialog = ({ onAssignmentComplete }: CenterAdminAssignmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [centerAdmins, setCenterAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/diagnostic-centers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers || []);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

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
      fetchCenters();
      fetchCenterAdmins();
    }
  }, [open]);

  const handleAssignment = async () => {
    if (!selectedCenterId || !selectedAdminId) {
      toast({
        title: "Missing Information",
        description: "Please select both a center and an admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/assign-center-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          centerId: selectedCenterId,
          adminId: selectedAdminId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Admin assigned successfully",
        });
        setOpen(false);
        setSelectedCenterId("");
        setSelectedAdminId("");
        onAssignmentComplete();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to assign admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCenter = centers.find(c => c._id === selectedCenterId);
  const selectedAdmin = centerAdmins.find(a => a._id === selectedAdminId);
  const availableAdmins = centerAdmins.filter(admin => !admin.diagnosticCenterId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Center Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Center Administrator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Center Selection */}
            <div className="space-y-2">
              <Label htmlFor="center">Select Diagnostic Center</Label>
              <Select value={selectedCenterId} onValueChange={setSelectedCenterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center._id} value={center._id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{center.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {center.adminId ? `Current: ${center.adminId.name}` : 'No admin assigned'}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Admin Selection */}
            <div className="space-y-2">
              <Label htmlFor="admin">Select Administrator</Label>
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
                  No unassigned center admins available
                </p>
              )}
            </div>
          </div>

          {/* Assignment Preview */}
          {selectedCenter && selectedAdmin && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Assignment Preview:</p>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Center:</span> {selectedCenter.name}</p>
                    <p><span className="text-muted-foreground">New Admin:</span> {selectedAdmin.name} ({selectedAdmin.email})</p>
                    {selectedCenter.adminId && (
                      <p className="text-amber-600">
                        <span className="text-muted-foreground">Replacing:</span> {selectedCenter.adminId.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignment} 
              disabled={!selectedCenterId || !selectedAdminId || loading}
            >
              {loading ? "Assigning..." : "Assign Admin"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CenterAdminAssignmentDialog;