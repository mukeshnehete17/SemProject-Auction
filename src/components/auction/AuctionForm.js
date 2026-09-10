"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  FileText,
  DollarSign,
  X,
  Link as LinkIcon,
  Calendar,
  IndianRupee,
} from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  imageUrl: "",
  startingPrice: "",
  bidIncrement: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

function isValidImageUrl(value) {
  return /^https?:\/\/\S+$/i.test(value) || value.startsWith("/");
}

export default function AuctionForm({
  categories = [],
  action,
  submitLabel = "Create Auction",
  busyLabel = "Creating...",
  initialValues,
}) {
  const [form, setForm] = useState(initialValues || emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (formError) setFormError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }
    if (!form.description.trim() || form.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!form.category) {
      newErrors.category = "Please select a category";
    }
    if (!form.startingPrice || parseFloat(form.startingPrice) <= 0) {
      newErrors.startingPrice = "Starting price must be greater than 0";
    }
    if (!form.bidIncrement || parseFloat(form.bidIncrement) <= 0) {
      newErrors.bidIncrement = "Bid increment must be greater than 0";
    }
    if (form.imageUrl && !isValidImageUrl(form.imageUrl.trim())) {
      newErrors.imageUrl = "Please enter a valid image URL";
    }
    if (!form.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!form.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (form.startDate && form.startTime && form.endDate && form.endTime) {
      const start = new Date(`${form.startDate}T${form.startTime}`);
      const end = new Date(`${form.endDate}T${form.endTime}`);
      if (end <= start) {
        newErrors.endDate = "End date/time must be after start date/time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError("");

    const result = await action({
      title: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.category,
      imageUrl: form.imageUrl.trim(),
      startingPrice: form.startingPrice,
      minimumIncrement: form.bidIncrement,
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate,
      endTime: form.endTime,
    });

    if (result?.error) {
      setFormError(result.error);
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" />
          Product Information
        </h2>

        <Input
          label="Product Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. MacBook Air M2"
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Describe your product in detail..."
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors resize-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? (
              <p className="text-red-600 text-sm">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-sm text-gray-400 ml-auto">
              {form.description.length}/500
            </p>
          </div>
        </div>

        <Select
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          options={categoryOptions}
          error={errors.category}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl}
                icon={LinkIcon}
              />
            </div>
          </div>

          {form.imageUrl && isValidImageUrl(form.imageUrl.trim()) ? (
            <div className="relative inline-block mt-4">
              <img
                src={form.imageUrl.trim()}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            !form.imageUrl && (
              <div className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Paste an image URL above to preview it
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-400" />
          Auction Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Starting Price"
            name="startingPrice"
            type="number"
            value={form.startingPrice}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            icon={IndianRupee}
            error={errors.startingPrice}
            required
          />
          <Input
            label="Minimum Bid Increment"
            name="bidIncrement"
            type="number"
            value={form.bidIncrement}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            icon={IndianRupee}
            error={errors.bidIncrement}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
          />
          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            error={errors.endDate}
            required
          />
          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleChange}
            error={errors.endTime}
            required
          />
        </div>
      </div>

      {formError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {formError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? busyLabel : submitLabel}
        </Button>
        <Button href="/dashboard/my-auctions" variant="secondary" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}