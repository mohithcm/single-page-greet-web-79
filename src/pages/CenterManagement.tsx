import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";

interface DiagnosticCenter {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  services: string[];
  isActive: boolean;
}

const CenterManagement = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const [newCenter, setNewCenter] = useState({
    name: "xyz hospital",
    description: "pqt.",
    address: {
      street: "Main Road",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "231323",
      country: "India",
    },
    phone: "12343434",
    email: "abc@gmail.com",
    operatingHours: {
      monday: { open: "08:00", close: "20:00" },
      tuesday: { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday: { open: "08:00", close: "20:00" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "08:00", close: "18:00" },
      sunday: { open: "09:00", close: "13:00" },
    },
    services: ["CBC", "Dengue Test"],
    isActive: true,
    _id: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/diagnostic-centers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCenters(data.centers); // <-- Fix: use data.centers, not data
      } else {
        toast({
          title: "Error",
          description: "Failed to load centers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch centers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(center.address)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      center.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setNewCenter((prevState) => ({
        ...prevState,
        address: {
          ...prevState.address,
          [addressField]: value,
        },
      }));
    } else if (name === "services") {
      setNewCenter((prevState) => ({
        ...prevState,
        services: value.split(",").map((s) => s.trim()),
      }));
    } else {
      setNewCenter((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/diagnostic-centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCenter),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Center created successfully!",
        });
        setShowAddModal(false);
        fetchCenters(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: "Failed to create center",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create center error:", error);
      toast({
        title: "Error",
        description: "Failed to create center",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading centers...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Center Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Oversee diagnostic centers and operations
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Center
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                placeholder="Search by name, address, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Centers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((center) => (
              <Card key={center._id}>
                <CardContent>
                  <h3 className="font-semibold">{center.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {center.address?.street}, {center.address?.city}
                  </p>
                  <p className="text-sm text-muted-foreground">{center.phone}</p>
                  <p className="text-sm text-muted-foreground">{center.email}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No centers found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No diagnostic centers available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Center Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full p-6">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Add New Diagnostic Center</CardTitle>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[600px]">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={newCenter.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      type="text"
                      id="description"
                      name="description"
                      value={newCenter.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.street">Street</Label>
                    <Input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={newCenter.address.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={newCenter.address.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.state">State</Label>
                    <Input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={newCenter.address.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.zipCode">Zip Code</Label>
                    <Input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={newCenter.address.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.country">Country</Label>
                    <Input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={newCenter.address.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      type="text"
                      id="phone"
                      name="phone"
                      value={newCenter.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={newCenter.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Input
                      type="text"
                      id="services"
                      name="services"
                      value={newCenter.services.join(", ")}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    <div className="col-span-1"></div>
                    <div className="col-span-2">Open</div>
                    <div className="col-span-2">Close</div>
                    <div className="col-span-2"></div>
                  </div>

                  {Object.entries(newCenter.operatingHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="grid grid-cols-7 gap-2 items-center"
                    >
                      <Label
                        htmlFor={`operatingHours.${day}.open`}
                        className="col-span-1 capitalize"
                      >
                        {day}
                      </Label>
                      <Input
                        type="time"
                        id={`operatingHours.${day}.open`}
                        name={`operatingHours.${day}.open`}
                        value={hours.open}
                        onChange={handleInputChange}
                        className="col-span-2"
                      />
                      <Input
                        type="time"
                        id={`operatingHours.${day}.close`}
                        name={`operatingHours.${day}.close`}
                        value={hours.close}
                        onChange={handleInputChange}
                        className="col-span-2"
                      />
                      <div className="col-span-2"></div>
                    </div>
                  ))}

                  <Button type="submit">Create Center</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterManagement;