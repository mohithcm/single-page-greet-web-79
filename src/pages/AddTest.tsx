import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { TestTube, Plus, Loader2, Building2, MapPin } from "lucide-react";

interface TestFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  preparationInstructions: string;
  requirements: string[];
}

interface DiagnosticCenter {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
}

const AddTest = () => {
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    preparationInstructions: '',
    requirements: []
  });
  const [loading, setLoading] = useState(false);
  const [centerLoading, setCenterLoading] = useState(true);
  const [newRequirement, setNewRequirement] = useState('');
  const [centerInfo, setCenterInfo] = useState<DiagnosticCenter | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { value: 'blood_test', label: 'Blood Test' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchCenterInfo();
  }, []);

  const fetchCenterInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/diagnostic-center-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCenterInfo(result.data.diagnosticCenter);
      } else {
        toast({
          title: "Error",
          description: "Failed to load center information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch center info error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch center information",
        variant: "destructive",
      });
    } finally {
      setCenterLoading(false);
    }
  };

  const handleInputChange = (field: keyof TestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/diagnostic-center-admin/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          preparationInstructions: formData.preparationInstructions,
          requirements: formData.requirements
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test added successfully",
        });
        navigate('/diagnostic-center-admin');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add test",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Add test error:', error);
      toast({
        title: "Error",
        description: "An error occurred while adding the test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Center Information Card */}
          {centerLoading ? (
            <Card className="mb-6">
              <CardContent className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading center information...</p>
              </CardContent>
            </Card>
          ) : centerInfo ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Adding Test to: {centerInfo.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {centerInfo.address.street}, {centerInfo.address.city}, {centerInfo.address.state}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6" />
                Add New Test
              </CardTitle>
              <CardDescription>
                Add a new diagnostic test to your center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Test Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Test Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter test name"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="30"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the test"
                    rows={3}
                  />
                </div>

                {/* Preparation Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="preparationInstructions">Preparation Instructions</Label>
                  <Textarea
                    id="preparationInstructions"
                    value={formData.preparationInstructions}
                    onChange={(e) => handleInputChange('preparationInstructions', e.target.value)}
                    placeholder="Instructions for test preparation (e.g., fasting required)"
                    rows={3}
                  />
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                    />
                    <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{req}</span>
                          <Button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Test...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/diagnostic-center-admin')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddTest;