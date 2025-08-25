import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DeleteConfirmationModal from "../../../components/ui/modal/DeleteConfirmationModal";
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { apiClient, TaxSlab, SalaryComponent, CreateTaxSlabRequest, CreateSalaryComponentRequest } from '../../../services/api';

interface DeleteModalState {
  isOpen: boolean;
  type: 'taxSlab' | 'salaryComponent' | null;
  itemId: string | null;
  itemName: string | null;
}

const SalaryConfiguration = () => {
  // Add marital status categories
  const maritalStatusCategories = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" }
  ];

  const [activeCategory, setActiveCategory] = useState<'single' | 'married'>('single');
  const [taxSlabsByCategory, setTaxSlabsByCategory] = useState<Record<'single' | 'married', TaxSlab[]>>({ single: [], married: [] });
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSlab, setEditingSlab] = useState<TaxSlab | null>(null);
  const [newSlab, setNewSlab] = useState({
    min_amount: "",
    max_amount: "",
    tax_rate: "",
    description: ""
  });

  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [newComponent, setNewComponent] = useState({
    name: "",
    percentage: "",
    is_mandatory: false,
    description: ""
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: null,
    itemId: null,
    itemName: null
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const [slabs, components] = await Promise.all([
        apiClient.getTaxSlabs(),
        apiClient.getSalaryComponents()
      ]);
      setTaxSlabsByCategory({
        single: slabs.filter((s: TaxSlab) => s.category === 'single'),
        married: slabs.filter((s: TaxSlab) => s.category === 'married')
      });
      setSalaryComponents(components);
    } catch {
      toast.error('Failed to load salary configuration');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateTaxSlab = (slab: { min_amount: string; max_amount: string; tax_rate: string; description: string }) => {
    const errors: string[] = [];
    
    if (!slab.min_amount || parseFloat(slab.min_amount) < 0) {
      errors.push("Minimum amount must be 0 or greater");
    }
    
    if (!slab.max_amount || parseFloat(slab.max_amount) <= 0) {
      errors.push("Maximum amount must be greater than 0");
    }
    
    if (!slab.tax_rate || parseFloat(slab.tax_rate) < 0 || parseFloat(slab.tax_rate) > 100) {
      errors.push("Tax rate must be between 0 and 100");
    }
    
    if (!slab.description.trim()) {
      errors.push("Description is required");
    }
    
    if (parseFloat(slab.min_amount) >= parseFloat(slab.max_amount)) {
      errors.push("Minimum amount must be less than maximum amount");
    }
    
    return errors;
  };

  const validateSalaryComponent = (component: { name: string; percentage: string; description: string }) => {
    const errors: string[] = [];
    
    if (!component.name.trim()) {
      errors.push("Component name is required");
    }
    
    if (!component.percentage || parseFloat(component.percentage) < 0 || parseFloat(component.percentage) > 100) {
      errors.push("Percentage must be between 0 and 100");
    }
    
    if (!component.description.trim()) {
      errors.push("Description is required");
    }
    
    return errors;
  };

  // Tax Slab Functions
  const handleAddTaxSlab = async () => {
    const errors = validateTaxSlab(newSlab);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    try {
      const slab: CreateTaxSlabRequest = {
        category: activeCategory as 'single' | 'married',
        min_amount: parseFloat(newSlab.min_amount),
        max_amount: newSlab.max_amount ? parseFloat(newSlab.max_amount) : null,
        tax_rate: parseFloat(newSlab.tax_rate),
        description: newSlab.description
      };
      const created = await apiClient.createTaxSlab(slab);
      setTaxSlabsByCategory(prev => ({
        ...prev,
        [activeCategory]: [...prev[activeCategory], created]
      }));
      setNewSlab({ min_amount: "", max_amount: "", tax_rate: "", description: "" });
      toast.success("Tax slab added successfully!");
    } catch {
      toast.error('Failed to add tax slab');
    }
  };

  const handleEditTaxSlab = (slab: TaxSlab) => {
    setEditingSlab(slab);
    setNewSlab({
      min_amount: slab.min_amount.toString(),
      max_amount: slab.max_amount?.toString() ?? "",
      tax_rate: slab.tax_rate.toString(),
      description: slab.description || ""
    });
  };

  const handleUpdateTaxSlab = async () => {
    if (!editingSlab) return;
    const errors = validateTaxSlab(newSlab);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    try {
      const updated = await apiClient.updateTaxSlab(editingSlab.id, {
        min_amount: parseFloat(newSlab.min_amount),
        max_amount: newSlab.max_amount ? parseFloat(newSlab.max_amount) : null,
        tax_rate: parseFloat(newSlab.tax_rate),
        description: newSlab.description
      });
      setTaxSlabsByCategory(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].map(s => s.id === updated.id ? updated : s)
      }));
      setEditingSlab(null);
      setNewSlab({ min_amount: "", max_amount: "", tax_rate: "", description: "" });
      toast.success("Tax slab updated successfully!");
    } catch {
      toast.error('Failed to update tax slab');
    }
  };

  const handleDeleteTaxSlab = (slabId: number) => {
    setDeleteModal({ isOpen: true, type: 'taxSlab', itemId: slabId.toString(), itemName: null });
  };

  const confirmDeleteTaxSlab = async () => {
    if (!deleteModal.itemId) return;
    try {
      await apiClient.deleteTaxSlab(Number(deleteModal.itemId));
      setTaxSlabsByCategory(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].filter(s => s.id !== Number(deleteModal.itemId))
      }));
      setDeleteModal({ isOpen: false, type: null, itemId: null, itemName: null });
      toast.success("Tax slab deleted successfully!");
    } catch {
      toast.error('Failed to delete tax slab');
    }
  };

  const handleCancelEdit = () => {
    setEditingSlab(null);
    setEditingComponent(null);
    setNewSlab({ min_amount: "", max_amount: "", tax_rate: "", description: "" });
    setNewComponent({ name: "", percentage: "", is_mandatory: false, description: "" });
  };

  // Salary Component Functions
  const handleAddSalaryComponent = async () => {
    const errors = validateSalaryComponent(newComponent);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    try {
      const comp: CreateSalaryComponentRequest = {
        name: newComponent.name,
        percentage: parseFloat(newComponent.percentage),
        is_mandatory: newComponent.is_mandatory,
        description: newComponent.description
      };
      const created = await apiClient.createSalaryComponent(comp);
      setSalaryComponents(prev => [...prev, created]);
      setNewComponent({ name: "", percentage: "", is_mandatory: false, description: "" });
      toast.success("Salary component added successfully!");
    } catch {
      toast.error('Failed to add salary component');
    }
  };

  const handleEditSalaryComponent = (component: SalaryComponent) => {
    setEditingComponent(component);
    setNewComponent({
      name: component.name,
      percentage: component.percentage.toString(),
      is_mandatory: component.is_mandatory,
      description: component.description || ""
    });
  };

  const handleUpdateSalaryComponent = async () => {
    if (!editingComponent) return;
    const errors = validateSalaryComponent(newComponent);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    try {
      const updated = await apiClient.updateSalaryComponent(editingComponent.id, {
        name: newComponent.name,
        percentage: parseFloat(newComponent.percentage),
        is_mandatory: newComponent.is_mandatory,
        description: newComponent.description
      });
      setSalaryComponents(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingComponent(null);
      setNewComponent({ name: "", percentage: "", is_mandatory: false, description: "" });
      toast.success("Salary component updated successfully!");
    } catch {
      toast.error('Failed to update salary component');
    }
  };

  const handleDeleteSalaryComponent = (componentId: number) => {
    setDeleteModal({ isOpen: true, type: 'salaryComponent', itemId: componentId.toString(), itemName: null });
  };

  const confirmDeleteSalaryComponent = async () => {
    if (!deleteModal.itemId) return;
    try {
      await apiClient.deleteSalaryComponent(Number(deleteModal.itemId));
      setSalaryComponents(prev => prev.filter(c => c.id !== Number(deleteModal.itemId)));
      setDeleteModal({ isOpen: false, type: null, itemId: null, itemName: null });
      toast.success("Salary component deleted successfully!");
    } catch {
      toast.error('Failed to delete salary component');
    }
  };

  const getTotalPercentage = () => {
    return salaryComponents.reduce((total, comp) => total + comp.percentage, 0);
  };

  const getDeleteModalProps = () => {
    if (deleteModal.type === 'taxSlab') {
      return {
        title: "Delete Tax Slab",
        message: "Are you sure you want to delete the tax slab",
        onConfirm: confirmDeleteTaxSlab
      };
    } else if (deleteModal.type === 'salaryComponent') {
      return {
        title: "Delete Salary Component",
        message: "Are you sure you want to delete the salary component",
        onConfirm: confirmDeleteSalaryComponent
      };
    }
    return {
      title: "Delete Item",
      message: "Are you sure you want to delete this item",
      onConfirm: () => {}
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading salary configuration...</span>
      </div>
    );
  }

  return (
    <div className="">
      <PageBreadcrumb pageTitle="Salary Configuration" />
      
      {/* Move category buttons to the top */}
      <div className="flex gap-4 mb-6">
        {maritalStatusCategories.map(cat => (
          <button
            key={cat.value}
            className={`px-4 py-2 rounded ${activeCategory === cat.value ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveCategory(cat.value as 'single' | 'married')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* Tax Slabs Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tax Slabs Configuration</h3>
            <p className="text-sm text-gray-500">Configure income tax slabs and rates</p>
          </div>

          {/* Add/Edit Tax Slab Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingSlab ? "Edit Tax Slab" : "Add New Tax Slab"}
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                <Input
                  type="number"
                  id="minAmount"
                  value={newSlab.min_amount}
                  onChange={(e) => setNewSlab(prev => ({ ...prev, min_amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
                <Input
                  type="number"
                  id="maxAmount"
                  value={newSlab.max_amount}
                  onChange={(e) => setNewSlab(prev => ({ ...prev, max_amount: e.target.value }))}
                  placeholder="500000"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  type="number"
                  id="taxRate"
                  value={newSlab.tax_rate}
                  onChange={(e) => setNewSlab(prev => ({ ...prev, tax_rate: e.target.value }))}
                  placeholder="1"
                  min="0"
                  max="100"
                  step={0.01}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  value={newSlab.description}
                  onChange={(e) => setNewSlab(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Basic tax slab"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {editingSlab ? (
                <>
                  <button
                    onClick={handleUpdateTaxSlab}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Update Slab
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddTaxSlab}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Tax Slab
                </button>
              )}
            </div>
          </div>

          {/* Tax Slabs Table */}
          <div className="overflow-x-auto">
            {taxSlabsByCategory[activeCategory].length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                No tax slabs found for this category.<br />
                <span className="font-medium">Add a new tax slab below:</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slab Range (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxSlabsByCategory[activeCategory].map((slab: TaxSlab) => (
                    <tr key={slab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slab.min_amount.toLocaleString()} - {slab.max_amount !== null ? slab.max_amount.toLocaleString() : 'No Limit'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {slab.tax_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {slab.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTaxSlab(slab)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Tax Slab"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTaxSlab(slab.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Tax Slab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Salary Components Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Salary Components Configuration</h3>
              <p className="text-sm text-gray-500">Configure salary structure components</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Percentage</p>
              <p className={`text-lg font-semibold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalPercentage()}%
              </p>
            </div>
          </div>

          {/* Add/Edit Salary Component Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingComponent ? "Edit Salary Component" : "Add New Salary Component"}
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="componentName">Component Name</Label>
                <Input
                  type="text"
                  id="componentName"
                  value={newComponent.name}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Basic Salary"
                />
              </div>
              <div>
                <Label htmlFor="percentage">Percentage (%)</Label>
                <Input
                  type="number"
                  id="percentage"
                  value={newComponent.percentage}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, percentage: e.target.value }))}
                  placeholder="60"
                  min="0"
                  max="100"
                  step={0.01}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  value={newComponent.description}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Base salary component"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMandatory"
                  checked={newComponent.is_mandatory}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isMandatory" className="ml-2">
                  Mandatory Component
                </Label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {editingComponent ? (
                <>
                  <button
                    onClick={handleUpdateSalaryComponent}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Update Component
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddSalaryComponent}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
              )}
            </div>
          </div>

          {/* Salary Components Table */}
          <div className="overflow-x-auto">
            {salaryComponents.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                No salary components found.<br />
                <span className="font-medium">Add a new salary component below:</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaryComponents.map((component: SalaryComponent) => (
                    <tr key={component.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {component.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.is_mandatory ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Mandatory
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {component.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSalaryComponent(component)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Component"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSalaryComponent(component.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Configuration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Tax Slabs:</span>
                <span className="ml-2 font-medium">{taxSlabsByCategory[activeCategory].length}</span>
              </div>
              <div>
                <span className="text-blue-700">Total Salary Components:</span>
                <span className="ml-2 font-medium">{salaryComponents.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Mandatory Components:</span>
                <span className="ml-2 font-medium">
                  {salaryComponents.filter(comp => comp.is_mandatory).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, itemId: null, itemName: null })}
        onConfirm={getDeleteModalProps().onConfirm}
        title={getDeleteModalProps().title}
        message={getDeleteModalProps().message}
        itemName={deleteModal.itemName || undefined}
      />
    </div>
  );
};

export default SalaryConfiguration;