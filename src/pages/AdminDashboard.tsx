import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, Calendar, TestTube, Activity, Settings, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import CenterAdminAssignmentDialog from "@/components/CenterAdminAssignmentDialog";
import UpdateCenterAdminDialog from "@/components/UpdateCenterAdminDialog";

interface DashboardStats {
  totalUsers: number;
  totalCenters: number;
  totalAppointments: number;
  totalTests: number;
  recentAppointments: Array<{
    _id: string;
    patientId: { name: string };
    testId: { name: string };
    diagnosticCenterId: { name: string };
    appointmentDate: string;
    status: string;
  }>;
  centerAdminBindings: Array<{
    _id: string;
    name: string;
    adminId: {
      _id: string;
      name: string;
      email: string;
    } | null;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // Redirect diagnostic center admins to their specific dashboard
      if (JSON.parse(userData).role === 'diagnostic_center_admin') {
        navigate('/diagnostic-center-admin');
        return;
      }
    }
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Dashboard response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API response:', data);
        
        // The API returns data wrapped in a stats object
        if (data.success && data.stats) {
          console.log('Center Admin Bindings from API:', data.stats.centerAdminBindings);
          setStats({
            totalUsers: data.stats.totalUsers,
            totalCenters: data.stats.totalCenters,
            totalAppointments: data.stats.totalAppointments,
            totalTests: data.stats.totalTests,
            recentAppointments: data.stats.recentAppointments || [],
            centerAdminBindings: data.stats.centerAdminBindings || []
          });
        } else {
          console.error('Unexpected API response structure:', data);
          setStats(null);
        }
      } else {
        const errorText = await response.text();
        console.error('Dashboard API error:', errorText);
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = (center: any) => {
    setSelectedCenter(center);
    setUpdateDialogOpen(true);
  };

  const handleRemoveAdmin = async (centerId: string, centerName: string) => {
    if (!confirm(`Are you sure you want to remove the admin assignment from ${centerName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/remove-center-admin/${centerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin assignment removed successfully",
        });
        fetchDashboardStats();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to remove admin assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Remove admin error:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin assignment",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <BackButton />
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === 'super_admin' ? 'Super Admin Panel' : 
               user?.role === 'diagnostic_center_admin' ? 'Center Management Dashboard' : 
               'Admin Panel'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'super_admin' ? 'Complete system administration and oversight' :
               user?.role === 'diagnostic_center_admin' ? 'Manage your diagnostic center operations' :
               'Administrative dashboard and center management'}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {user?.role?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagnostic Centers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCenters}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(user?.role === 'super_admin' || user?.role === 'admin') && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/users')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage users, roles, and permissions</CardDescription>
                </CardHeader>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/centers')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Center Management
                  </CardTitle>
                  <CardDescription>Oversee diagnostic centers and operations</CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
          
          {user?.role === 'diagnostic_center_admin' && (
            <>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Management
                  </CardTitle>
                  <CardDescription>Manage available diagnostic tests</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Management
                  </CardTitle>
                  <CardDescription>View and manage appointments</CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
          
          {user?.role === 'super_admin' && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/admin/settings')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Center Admin Bindings */}
        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Center Admin Assignments</CardTitle>
                <CardDescription>
                  Diagnostic centers and their assigned administrators
                </CardDescription>
              </div>
              {user?.role === 'super_admin' && (
                <CenterAdminAssignmentDialog onAssignmentComplete={fetchDashboardStats} />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.centerAdminBindings?.length > 0 ? stats.centerAdminBindings.map((center) => (
                  <div key={center._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {center.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {center.adminId 
                          ? `Admin: ${center.adminId.name} (${center.adminId.email})`
                          : "No admin assigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={center.adminId ? 'default' : 'secondary'}>
                        {center.adminId ? 'Assigned' : 'Unassigned'}
                      </Badge>
                      {user?.role === 'super_admin' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdmin(center)}
                          >
                            {center.adminId ? 'Update' : 'Assign'}
                          </Button>
                          {center.adminId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveAdmin(center._id, center.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No diagnostic centers found</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>
              {user?.role === 'diagnostic_center_admin' 
                ? 'Latest appointments for your center'
                : 'Latest appointment bookings in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAppointments?.length > 0 ? stats.recentAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">
                      {appointment.patientId?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.testId?.name} at {appointment.diagnosticCenterId?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No recent appointments found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Update Dialog */}
        {selectedCenter && (
          <UpdateCenterAdminDialog
            open={updateDialogOpen}
            onClose={() => {
              setUpdateDialogOpen(false);
              setSelectedCenter(null);
            }}
            center={selectedCenter}
            onUpdateComplete={fetchDashboardStats}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

