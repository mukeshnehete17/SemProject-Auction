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
  Image as ImageIcon,
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
      {/* Product Details Section */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-zinc-400" />
            <span>Product & Lot Details</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Specify accurate title, description, and high-resolution imagery for prospective bidders.
          </p>
        </div>

        <Input
          label="Lot Title"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Leica M6 Titanium 35mm Rangefinder Camera"
          error={errors.name}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
            Lot Description <span className="text-rose-500 ml-1 font-normal">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Describe provenance, cosmetic condition, serial numbers, and packaging..."
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors resize-none shadow-2xs ${
              errors.description ? "border-rose-400" : "border-zinc-300"
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? (
              <p className="text-rose-600 text-xs font-medium">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs font-mono text-zinc-400 ml-auto">
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
            Product Visual (URL)
          </label>
          <div className="relative">
            <Input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              error={errors.imageUrl}
              icon={LinkIcon}
            />
          </div>

          {form.imageUrl && isValidImageUrl(form.imageUrl.trim()) ? (
            <div className="relative inline-block mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl.trim()}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-xl border border-zinc-200 shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                className="absolute -top-2 -right-2 p-1 bg-zinc-900 text-white rounded-full hover:bg-rose-600 transition-colors shadow-xs"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            !form.imageUrl && (
              <div className="mt-4 w-full border border-dashed border-zinc-200 rounded-xl p-8 text-center bg-zinc-50/50">
                <ImageIcon className="h-7 w-7 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">
                  Provide an image URL to preview the lot presentation
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Pricing & Timing Section */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-zinc-400" />
            <span>Valuation & Schedule</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Set starting reserve and bidding windows. All prices in INR (₹).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Starting Reserve Price"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Auction Opening Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
          />
          <Input
            label="Opening Time"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Closing Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            error={errors.endDate}
            required
          />
          <Input
            label="Closing Time"
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
        <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-4">
          {formError}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? busyLabel : submitLabel}
        </Button>
        <Button href="/dashboard/my-auctions" variant="outline" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}