import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import {Plus} from 'lucide-react'

const Organisations = () => {
  return (
    <div className="">
      <PageBreadcrumb pageTitle="Add Organisations" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label htmlFor="input">Organisation Name</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Address</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Email</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Contact No</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Contact Person</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Contact Person No</Label>
            <Input type="text" id="input" />
          </div>
          <div>
            <Label htmlFor="input">Organisation Contact Person Email</Label>
            <Input type="text" id="input" />
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            onClick={() => {
              "/organisations";
            }}
          >
            <Plus className="size-5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Organisations;
